import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { getOwnerAnalytics } from '@/features/owner/analytics';

export default async function OwnerAnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  // Load analytics data for the owner
  const analytics = await getOwnerAnalytics();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-semibold text-[var(--text-primary)]">Analytics</h1>
        <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Summary of your properties and services
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)]">
          <p className="text-sm text-[var(--text-muted)]">Total Properties</p>
          <p className="text-2xl font-bold">{analytics.totalProperties}</p>
        </div>
        <div className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)]">
          <p className="text-sm text-[var(--text-muted)]">Completed Services</p>
          <p className="text-2xl font-bold">{analytics.completedServices}</p>
        </div>
        <div className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)]">
          <p className="text-sm text-[var(--text-muted)]">Total Revenue (TZS)</p>
          <p className="text-2xl font-bold">{analytics.totalRevenue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}