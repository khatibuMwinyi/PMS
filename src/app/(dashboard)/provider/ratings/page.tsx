import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { Suspense } from 'react';
import ProviderRatingsSkeleton from '@/components/dashboard/ProviderRatingsSkeleton';
import { getProviderDashboardData } from '@/features/analytics/queries';

export const dynamic = 'force-dynamic';

export default function ProviderRatingsPage() {
  return (
    <RoleGuard allowedRoles={['PROVIDER']}>
      <Suspense fallback={<ProviderRatingsSkeleton />}>
        <ProviderRatingsContent />
      </Suspense>
    </RoleGuard>
  );
}

async function ProviderRatingsContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'PROVIDER') redirect('/login');

  const { rating } = await getProviderDashboardData(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-semibold text-[var(--text-primary)]">Ratings</h1>
        <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Your average rating from customers</p>
      </div>
      <div className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)]">
        <p className="text-sm text-[var(--text-muted)]">Average Rating</p>
        <p className="text-3xl font-bold">{rating.toFixed(1)} ★</p>
      </div>
    </div>
  );
}