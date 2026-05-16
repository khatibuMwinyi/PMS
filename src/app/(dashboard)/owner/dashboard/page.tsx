import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { OwnerKpiCards } from '@/features/dashboard/components/owner/OwnerKpiCards';
import { OwnerActivePropertiesPanel } from '@/features/dashboard/components/owner/OwnerActivePropertiesPanel';
import { OwnerRecentRequestsPanel } from '@/features/dashboard/components/owner/OwnerRecentRequestsPanel';
import {
  KpiCardsSkeleton,
  PropertiesPanelSkeleton,
  RequestsPanelSkeleton,
} from '@/features/dashboard/components/owner/skeletons';

export const dynamic = 'force-dynamic';

export default async function OwnerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  const ownerUserId = session.user.id;
  const now = new Date();

  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <DashboardShell role="OWNER" userName={session.user.name} pageTitle="Dashboard">
        <DashboardHeader
          title="Dashboard Overview"
          subtitle="High-level metrics across all active properties."
          asOf={now}
        />

        <Suspense fallback={<KpiCardsSkeleton />}>
          <OwnerKpiCards ownerUserId={ownerUserId} />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Suspense fallback={<PropertiesPanelSkeleton />}>
              <OwnerActivePropertiesPanel ownerUserId={ownerUserId} />
            </Suspense>
          </div>
          <div className="lg:col-span-1">
            <Suspense fallback={<RequestsPanelSkeleton />}>
              <OwnerRecentRequestsPanel ownerUserId={ownerUserId} />
            </Suspense>
          </div>
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
