import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { OwnerServicesKpis } from '@/features/services-list/components/OwnerServicesKpis';
import { OwnerServicesTable } from '@/features/services-list/components/OwnerServicesTable';
import { getOwnerServiceList } from '@/features/services-list/services';
import {
  ServicesKpisSkeleton,
  ServicesTableSkeleton,
} from '@/features/services-list/components/skeletons';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

function ServicesContentSkeleton() {
  return (
    <>
      <ServicesKpisSkeleton />
      <ServicesTableSkeleton />
    </>
  );
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export default function OwnerServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <DashboardHeader
        serif
        title="Services"
        subtitle="Track active and historical service requests across your portfolio."
        action={
          <Link
            href="/owner/services/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--brand-gold)] text-[var(--brand-primary)] rounded-md text-sm font-medium hover:bg-[var(--brand-gold-dark)] transition-colors"
          >
            <Plus size={16} /> Request Service
          </Link>
        }
      />

      <Suspense fallback={<ServicesContentSkeleton />}>
        <ServicesContent searchParams={searchParams} />
      </Suspense>
    </RoleGuard>
  );
}

async function ServicesContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  const params = await searchParams;
  const page = parsePage(params.page);
  const ownerUserId = session.user.id;

  const { rows, total } = await getOwnerServiceList(ownerUserId, page, PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <OwnerServicesKpis ownerUserId={ownerUserId} />
      <OwnerServicesTable
        rows={rows}
        currentPage={page}
        totalPages={totalPages}
        basePath="/owner/services"
      />
    </div>
  );
}
