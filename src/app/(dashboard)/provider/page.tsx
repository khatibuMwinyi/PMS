import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { getProviderDashboard } from '@/features/dashboard/queries/provider';
import { ProviderKpiBento } from '@/features/dashboard/components/provider/ProviderKpiBento';
import { StrikeBanner } from '@/features/dashboard/components/provider/StrikeBanner';
import { NextUpcomingAssignmentCard } from '@/features/dashboard/components/provider/NextUpcomingAssignmentCard';
import { ActivePipelineTable } from '@/features/dashboard/components/provider/ActivePipelineTable';
import { TodayProgressTimeline } from '@/features/dashboard/components/provider/TodayProgressTimeline';
import { QuickActionsPanel } from '@/features/dashboard/components/provider/QuickActionsPanel';
import {
  KpiBentoSkeleton,
  PipelineSkeleton,
  UpcomingSkeleton,
} from '@/features/dashboard/components/provider/skeletons';

export const dynamic = 'force-dynamic';

export default function ProviderDashboardPage() {
  return (
    <RoleGuard allowedRoles={['PROVIDER']}>
      <DashboardHeader
        title="Overview"
        subtitle="Today's operational metrics and active assignments."
        asOf={new Date()}
      />
      <Suspense
        fallback={
          <>
            <KpiBentoSkeleton />
            <UpcomingSkeleton />
            <PipelineSkeleton />
          </>
        }
      >
        <DashboardContent />
      </Suspense>
    </RoleGuard>
  );
}

async function DashboardContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'PROVIDER') redirect('/login');

  const data = await getProviderDashboard(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <StrikeBanner metrics={data.metrics} />
      <ProviderKpiBento earnings={data.earnings} metrics={data.metrics} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <NextUpcomingAssignmentCard next={data.nextUpcoming} />
          <ActivePipelineTable pipeline={data.pipeline} />
        </div>
        <div className="flex flex-col gap-6">
          <TodayProgressTimeline steps={data.todayProgress} />
          <QuickActionsPanel />
        </div>
      </div>
    </div>
  );
}
