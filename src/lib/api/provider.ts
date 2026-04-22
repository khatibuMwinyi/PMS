import { getProviderDashboardData } from '@/features/analytics/queries';

/** Simple wrapper to expose provider earnings data */
export async function getProviderEarnings(userId: string) {
  // Reuse existing dashboard data; earnings are derived from wallet balances
  const data = await getProviderDashboardData(userId);
  return {
    availableBalance: data.availableBalance,
    pendingBalance: data.pendingBalance,
    // Additional earnings details could be added here in the future
  };
}
