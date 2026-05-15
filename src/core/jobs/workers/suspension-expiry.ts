import { prisma } from '@/core/database/client';
import { resetStrikesAfterSuspension } from '@/features/providers/strikes';

/**
 * Reset strike count for providers whose 30-day suspension has expired.
 */
export const suspensionExpiryWorker = {
  name: 'suspension-expiry',
  handler: async () => {
    const expired = await prisma.providerProfile.findMany({
      where: {
        suspendedUntil: { not: null, lt: new Date() },
        strikeCount: { gt: 0 },
      },
      select: { id: true },
    });

    for (const provider of expired) {
      await resetStrikesAfterSuspension(provider.id);
    }

    if (expired.length > 0) {
      console.log(`[SUSPENSION] Cleared ${expired.length} provider suspensions`);
    }
  },
};
