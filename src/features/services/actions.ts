'use server';

import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';

export async function acceptAssignment(assignmentId: string) {
  const session = await auth();
  if (session?.user.role !== 'PROVIDER') throw new Error('Unauthorized');

  const provider = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!provider) throw new Error('Provider context missing');

  return await prisma.$transaction(async (tx) => {
    const assignment = await tx.assignment.findUnique({ where: { id: assignmentId } });

    if (!assignment || assignment.status !== 'PENDING_ACCEPTANCE') {
      throw new Error("Assignment no longer available");
    }

    // Safe Update via Version Check (Optimistic Concurrency)
    const updated = await tx.assignment.updateMany({
      where: {
        id: assignmentId,
        version: assignment.version,
        status: 'PENDING_ACCEPTANCE'
      },
      data: {
        status: 'ACCEPTED',
        providerId: provider.id,
        transitionedAt: new Date(),
        version: { increment: 1 }
      }
    });

    if (updated.count === 0) throw new Error("Conflict: Assignment accepted by another provider.");
    return { success: true };
  });
}