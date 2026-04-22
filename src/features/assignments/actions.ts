'use server';

import { revalidatePath } from 'next/cache';
import { Prisma }         from '@prisma/client';
import { prisma }         from '@/core/database/client';
import { auth }           from '@/core/auth';
import type { AcceptResult } from './types';

/**
 * Accept a PENDING_ACCEPTANCE assignment.
 *
 * Uses optimistic concurrency (version field + updateMany) so if two providers
 * click simultaneously, exactly one wins and the other gets { conflict: true }.
 */
export async function acceptAssignment(assignmentId: string): Promise<AcceptResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'PROVIDER') {
    return { success: false, error: 'Unauthorized' };
  }

  const provider = await prisma.providerProfile.findUnique({
    where:  { userId: session.user.id },
    select: { id: true },
  });
  if (!provider) {
    return { success: false, error: 'Provider profile not found' };
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // Read current state
        const assignment = await tx.assignment.findUnique({
          where:  { id: assignmentId },
          select: { id: true, status: true, version: true, expiresAt: true },
        });

        if (!assignment) {
          return { success: false, error: 'Assignment not found' };
        }
        if (assignment.status !== 'PENDING_ACCEPTANCE') {
          return { success: false, conflict: true };
        }
        if (assignment.expiresAt < new Date()) {
          return { success: false, error: 'This offer has expired.' };
        }

        // Conditional update — only succeeds if version hasn't changed
        const updated = await tx.assignment.updateMany({
          where: {
            id:      assignmentId,
            version: assignment.version,          // Optimistic lock
            status:  'PENDING_ACCEPTANCE',
          },
          data: {
            status:         'ACCEPTED',
            providerId:     provider.id,
            acceptedAt:     new Date(),
            transitionedAt: new Date(),
            version:        { increment: 1 },
          },
        });

        if (updated.count === 0) {
          // Another provider won the race
          return { success: false, conflict: true };
        }

        return { success: true };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    if (result.success) {
      revalidatePath('/provider/assignments');
    }

    return result;
  } catch (err: any) {
    console.error('acceptAssignment error:', err);
    return { success: false, error: 'Acceptance failed — please try again.' };
  }
}

/**
 * Reassign an expired assignment to another provider using tiered cascade.
 * Called by the pg-boss assignment-expiration worker.
 * 
 * Tiered Auto-Expansion: 5km/80% -> 10km/70% -> 15km/60%
 * Falls back to AUTO_REASSIGNED for manual staff review if no provider found.
 */
export async function reassignAssignment(assignmentId: string): Promise<void> {
  const { findBestProvider } = await import('@/features/services/queries');

  const assignment = await prisma.assignment.findUnique({
    where:  { id: assignmentId },
    select: { id: true, propertyId: true, serviceTypeId: true },
  });
  if (!assignment) return;

  const tiers = [
    { radius: 5, threshold: 0.8 },
    { radius: 10, threshold: 0.7 },
    { radius: 15, threshold: 0.6 },
  ];

  for (const tier of tiers) {
    const best = await findBestProvider(
      assignment.propertyId,
      assignment.serviceTypeId,
      tier.radius,
      tier.threshold,
    );

    if (best) {
      await prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          status:        'PENDING_ACCEPTANCE',
          providerId:   best.id,
          expiresAt:     new Date(Date.now() + 6 * 60 * 60 * 1000),
          transitionedAt: new Date(),
          version:      { increment: 1 },
        },
      });
      return;
    }
  }

  await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      status:         'AUTO_REASSIGNED',
      transitionedAt: new Date(),
      version:        { increment: 1 },
    },
  });
}