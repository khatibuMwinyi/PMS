import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { UtilityForm } from '@/features/utilities/components/UtilityForm';
import { UtilityTable } from '@/features/utilities/components/UtilityTable';
import {
  getOwnerUtilities,
  getOwnerPropertiesForUtility,
} from '@/features/utilities/services';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export default function OwnerUtilitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <DashboardHeader
        title="Utilities"
        subtitle="Track water, electricity, gas, and waste bills separately from Oweru services."
      />

      <Suspense
        fallback={
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md h-80 animate-pulse" />
            <div className="lg:col-span-2 bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md h-64 animate-pulse" />
          </div>
        }
      >
        <UtilitiesContent searchParams={searchParams} />
      </Suspense>
    </RoleGuard>
  );
}

async function UtilitiesContent({
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

  const [properties, { rows, total }] = await Promise.all([
    getOwnerPropertiesForUtility(ownerUserId),
    getOwnerUtilities(ownerUserId, page, PAGE_SIZE),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1">
        <UtilityForm properties={properties} />
      </div>
      <div className="lg:col-span-2">
        <UtilityTable
          rows={rows}
          currentPage={page}
          totalPages={totalPages}
          basePath="/owner/utilities"
        />
      </div>
    </div>
  );
}
