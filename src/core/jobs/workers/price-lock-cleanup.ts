import { cleanupExpiredLocks } from '@/features/pricing/lock'

export const priceLockCleanupWorker = {
  name: 'price-lock-cleanup',
  handler: async () => {
    await cleanupExpiredLocks()
    console.log('[price-lock-cleanup] Completed cleanup of expired price locks')
  },
}
