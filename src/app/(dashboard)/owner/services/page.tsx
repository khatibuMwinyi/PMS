import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Wrench, Plus, Download } from 'lucide-react';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { OwnerServicesKpis } from '@/features/services-list/components/OwnerServicesKpis';
import { OwnerServicesTable } from '@/features/services-list/components/OwnerServicesTable';
import {
  ServicesKpisSkeleton,
  ServicesTableSkeleton,
} from '@/features/services-list/components/skeletons';

export const dynamic = 'force-dynamic';

export default async function OwnerServicesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  const ownerUserId = session.user.id;

  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <DashboardHeader
          title="Services"
          subtitle="Track active and historical service requests across your portfolio."
        />
        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant rounded-md text-sm font-medium text-[var(--text-primary)] bg-[var(--surface-container-lowest)] hover:bg-[var(--surface-container-high)] transition-colors"
          >
            <Download size={16} /> Export
          </button>
          <Link
            href="/owner/services/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--brand-gold)] text-[var(--brand-primary)] rounded-md text-sm font-medium hover:bg-[var(--brand-gold-dark)] transition-colors"
          >
            <Plus size={16} /> Request Service
          </Link>
        </div>
      </div>

      <Suspense fallback={<ServicesKpisSkeleton />}>
        <OwnerServicesKpis ownerUserId={ownerUserId} />
      </Suspense>

      <Suspense fallback={<ServicesTableSkeleton />}>
        <OwnerServicesTable ownerUserId={ownerUserId} />
      </Suspense>
    </RoleGuard>
  );
}
