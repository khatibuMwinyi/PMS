import { Suspense } from 'react';
import { auth } from '@/core/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PortfolioOverview } from '@/features/dashboard/components/PortfolioOverview';
import { FinancialSummaryCards } from '@/features/dashboard/components/FinancialSummaryCards';
import { PropertyCardGrid } from '@/features/dashboard/components/PropertyCardGrid';
import { ServiceRequestsTable } from '@/features/dashboard/components/ServiceRequestsTable';
import { RoleGuard } from '@/components/RoleGuard';

export const dynamic = 'force-dynamic';

export default function OwnerDashboardPage() {
  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <Suspense fallback={<div>Loading...</div>}>
        <OwnerDashboardContent />
      </Suspense>
    </RoleGuard>
  );
}

async function OwnerDashboardContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  return (
    <DashboardShell role="OWNER" userName={session.user.name} pageTitle="Dashboard">
      {/* Portfolio Overview Section */}
      <PortfolioOverview
        title="Portfolio Overview"
        subtitle="Real-time status of your real estate investments"
      />

      {/* Financial Summary Cards */}
      <Suspense fallback={<div>Loading financials...</div>}>
        <FinancialSummaryCards />
      </Suspense>

      {/* Property Card Grid */}
      <Suspense fallback={<div>Loading properties...</div>}>
        <PropertyCardGrid />
      </Suspense>

      {/* Service Requests Table */}
      <Suspense fallback={<div>Loading service requests...</div>}>
        <ServiceRequestsTable />
      </Suspense>
    </DashboardShell>
  );
}
