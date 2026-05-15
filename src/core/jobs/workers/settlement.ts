import { settlePendingEarnings } from '@/features/wallets/actions';

/**
 * Settlement worker — moves PENDING earnings to availableBalance after 24h hold.
 * Spec §VI.1, §XIX.1
 */
export const settlementWorker = {
  name: 'settle-pending-earnings',
  handler: async () => {
    const { settled } = await settlePendingEarnings();
    if (settled > 0) {
      console.log(`[SETTLEMENT] Settled ${settled} pending wallet earnings`);
    }
  },
};
