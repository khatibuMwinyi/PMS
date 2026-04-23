import { auth } from '@/core/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getProviderDashboardData } from '@/features/analytics/queries';
import RoleGuard from '@/components/RoleGuard';
import ProviderDashboardSkeleton from '@/components/dashboard/ProviderDashboardSkeleton';
import { Suspense } from 'react';
import { ErrorBoundaryWrapper } from '@/components/ui/ErrorBoundary';

export const dynamic = 'force-dynamic';

export default function ProviderPage() {
  return (
    <RoleGuard allowedRoles={['PROVIDER']}>
      <Suspense fallback={<ProviderDashboardSkeleton />}>
        <ErrorBoundaryWrapper onRetry={() => window.location.reload()}>
          <ProviderDashboardContent />
        </ErrorBoundaryWrapper>
      </Suspense>
    </RoleGuard>
  );
}

async function ProviderDashboardContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'PROVIDER') redirect('/login');

  const data = await getProviderDashboardData(session.user.id);

  return (
    <DashboardShell role="PROVIDER" userName={session.user.name} pageTitle="Dashboard">
      <h2 className="text-xl font-semibold mb-4">Provider Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)]">
          <p className="text-sm text-[var(--text-muted)]">Available Balance</p>
          <p className="text-2xl font-bold">${data.availableBalance.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)]">
          <p className="text-sm text-[var(--text-muted)]">Pending Balance</p>
          <p className="text-2xl font-bold">${data.pendingBalance.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)]">
          <p className="text-sm text-[var(--text-muted)]">Active Assignments</p>
          <p className="text-2xl font-bold">{data.activeAssignments}</p>
        </div>
        <div className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)]">
          <p className="text-sm text-[var(--text-muted)]">Rating</p>
          <p className="text-2xl font-bold">{data.rating.toFixed(1)} ★</p>
        </div>
      </div>
    </DashboardShell>
  );
}