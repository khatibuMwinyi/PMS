'use server';

// Provider strike system per Spec §VIII + §XXII:
//   • No-show     +1 strike
//   • Dispute lost +1 strike
//   • Late completion (>2h overdue) +0.5 strike (rounded up across two incidents)
//   • 3 strikes  → SUSPENDED for 30 days
//   • Suspended providers cannot receive offers.

import { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { addDays } from 'date-fns';
import { prisma } from '@/core/database/client';

export type StrikeReason = 'NO_SHOW' | 'DISPUTE_LOST' | 'LATE_COMPLETION' | 'OTHER';

const STRIKE_WEIGHT: Record<StrikeReason, number> = {
  NO_SHOW: 1,
  DISPUTE_LOST: 1,
  LATE_COMPLETION: 0.5,
  OTHER: 1,
};

const SUSPENSION_THRESHOLD = 3;
const SUSPENSION_DAYS = 30;

export async function applyStrike(
  providerId: string,
  reason: StrikeReason,
  metadata?: Record<string, unknown>,
): Promise<{ totalStrikes: number; suspended: boolean }> {
  const weight = STRIKE_WEIGHT[reason];

  return prisma.$transaction(
    async (tx) => {
      const provider = await tx.providerProfile.findUnique({
        where: { id: providerId },
        select: { strikeCount: true, suspendedUntil: true },
      });
      if (!provider) throw new Error('Provider not found');

      await tx.providerStrike.create({
        data: {
          id: nanoid(),
          providerId,
          reason,
          metadata: metadata ?? undefined,
        },
      });

      const newCount = provider.strikeCount + weight;
      const shouldSuspend = newCount >= SUSPENSION_THRESHOLD;
      const suspendedUntil = shouldSuspend
        ? addDays(new Date(), SUSPENSION_DAYS)
        : provider.suspendedUntil;

      await tx.providerProfile.update({
        where: { id: providerId },
        data: {
          strikeCount: newCount,
          suspendedUntil: shouldSuspend ? suspendedUntil : provider.suspendedUntil,
        },
      });

      await tx.financialAuditLog.create({
        data: {
          id: nanoid(),
          entityType: 'PROVIDER',
          entityId: providerId,
          action: shouldSuspend ? 'PROVIDER_SUSPENDED' : 'STRIKE_APPLIED',
          payload: {
            reason,
            weight,
            totalStrikes: newCount,
            suspendedUntil: suspendedUntil?.toISOString(),
            metadata,
          },
        },
      });

      return { totalStrikes: newCount, suspended: shouldSuspend };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

/**
 * Reset strikes when suspension expires (called by housekeeping job).
 */
export async function resetStrikesAfterSuspension(providerId: string): Promise<void> {
  await prisma.providerProfile.update({
    where: { id: providerId },
    data: { strikeCount: 0, suspendedUntil: null },
  });
}
