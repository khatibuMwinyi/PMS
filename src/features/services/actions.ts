'use server';

import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';
import { findBestProvider } from './queries';

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

export async function reassignAssignment(assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) return;

  // Tiered Auto-Expansion: 5km/80% -> 10km/70% -> 15km/60%
  const tiers = [
    { radius: 5, threshold: 0.8 },
    { radius: 10, threshold: 0.7 },
    { radius: 15, threshold: 0.6 }
  ];

  for (const tier of tiers) {
    const best = await findBestProvider(
      assignment.propertyId, 
      assignment.serviceTypeId, 
      tier.radius, 
      tier.threshold
    );

    if (best) {
      await prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          status: 'PENDING_ACCEPTANCE',
          providerId: best.id,
          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // Reset 6h window
          transitionedAt: new Date(),
          version: { increment: 1 }
        }
      });
      return;
    }
  }

  // Final Fallback: Set to terminal state for manual staff review
  await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      status: 'AUTO_REASSIGNED',
      transitionedAt: new Date(),
      version: { increment: 1 }
    }
  });
}