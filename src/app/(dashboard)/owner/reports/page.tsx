import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Download } from 'lucide-react';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { MonthlySpendChart } from '@/features/owner-reports/components/MonthlySpendChart';
import { ServiceMixChart } from '@/features/owner-reports/components/ServiceMixChart';
import { PropertyCostTable } from '@/features/owner-reports/components/PropertyCostTable';
import {
  MonthlySpendSkeleton,
  ServiceMixSkeleton,
  PropertyCostSkeleton,
} from '@/features/owner-reports/components/skeletons';

export const dynamic = 'force-dynamic';

export default async function OwnerReportsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  const ownerUserId = session.user.id;

  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <DashboardHeader
          title="Reports"
          subtitle="Spending paid to Oweru, utility expenses, and per-property cost breakdown."
        />
        <button
          type="button"
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--brand-gold)] text-[var(--brand-primary)] rounded-md text-sm font-semibold hover:bg-[var(--brand-gold-dark)] transition-colors"
        >
          <Download size={16} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <Suspense fallback={<MonthlySpendSkeleton />}>
            <MonthlySpendChart ownerUserId={ownerUserId} />
          </Suspense>
        </div>
        <Suspense fallback={<ServiceMixSkeleton />}>
          <ServiceMixChart ownerUserId={ownerUserId} />
        </Suspense>
      </div>

      <Suspense fallback={<PropertyCostSkeleton />}>
        <PropertyCostTable ownerUserId={ownerUserId} />
      </Suspense>
    </RoleGuard>
  );
}
