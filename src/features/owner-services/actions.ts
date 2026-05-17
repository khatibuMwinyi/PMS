'use server';

import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import { Prisma } from '@prisma/client';
import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';
import { cancelAgreement } from '@/features/agreements/cancel';
import { createDispute } from '@/features/disputes/actions';

async function requireOwnerSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }
  return session.user;
}

async function assertOwnsAgreement(agreementId: string, ownerUserId: string) {
  const a = await prisma.agreement.findUnique({
    where: { id: agreementId },
    select: { ownerId: true },
  });
  if (!a) throw new Error('Agreement not found');
  if (a.ownerId !== ownerUserId) throw new Error('Forbidden');
}

export async function cancelOwnerAgreement(agreementId: string) {
  const user = await requireOwnerSession();
  await assertOwnsAgreement(agreementId, user.id);
  const result = await cancelAgreement(agreementId, user.id);
  revalidatePath('/owner/services');
  revalidatePath(`/owner/services/${agreementId}`);
  return result;
}

// Spec §VII: owner verifies completion within 24h. Auto-approve handled by
// background settler when window passes. This action is the explicit path.
export async function verifyOwnerAssignment(agreementId: string) {
  const user = await requireOwnerSession();
  await assertOwnsAgreement(agreementId, user.id);

  await prisma.$transaction(
    async (tx) => {
      const agreement = await tx.agreement.findUnique({
        where: { id: agreementId },
        include: { assignment: true },
      });
      if (!agreement?.assignment) throw new Error('No assignment to verify');
      if (agreement.assignment.status !== 'COMPLETED') {
        throw new Error('Assignment is not in COMPLETED state');
      }
      await tx.assignment.update({
        where: { id: agreement.assignment.id },
        data: { status: 'VERIFIED', verifiedAt: new Date() },
      });
      await tx.financialAuditLog.create({
        data: {
          id: nanoid(),
          entityType: 'ASSIGNMENT',
          entityId: agreement.assignment.id,
          action: 'OWNER_VERIFIED',
          payload: { actorId: user.id, agreementId },
        },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

  revalidatePath('/owner/services');
  revalidatePath(`/owner/services/${agreementId}`);
}

// Owner files dispute against the latest COMPLETED task on the assignment.
export async function fileOwnerDispute(
  agreementId: string,
  reason: string,
  notes: string,
) {
  const user = await requireOwnerSession();
  await assertOwnsAgreement(agreementId, user.id);

  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
    include: {
      assignment: {
        include: {
          tasks: {
            where: { status: 'COMPLETED' },
            orderBy: { scheduledFor: 'desc' },
            take: 1,
          },
        },
      },
    },
  });
  const task = agreement?.assignment?.tasks[0];
  if (!task) throw new Error('No completed task available to dispute');

  await createDispute(task.id, reason, { images: [], notes });
  revalidatePath('/owner/services');
  revalidatePath(`/owner/services/${agreementId}`);
}
