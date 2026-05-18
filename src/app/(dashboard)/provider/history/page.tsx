import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { Pagination } from '@/shared/components/ui/Pagination';
import { HistoryFilters } from '@/features/tasks/components/HistoryFilters';
import { HistoryTable, HistoryTableSkeleton } from '@/features/tasks/components/HistoryTable';
import { getProviderTaskHistory } from '@/features/tasks/queries';
import type { HistoryStatus } from '@/features/tasks/queries';

export const dynamic = 'force-dynamic';

const ALL_STATUSES: HistoryStatus[] = ['COMPLETED', 'VERIFIED', 'DISPUTED', 'OVERDUE', 'CANCELLED'];
const PAGE_SIZE = 20;

function parseStatuses(raw: string | undefined): HistoryStatus[] {
  if (!raw) return [];
  const parts = raw.split(',').map((p) => p.trim().toUpperCase());
  return parts.filter((p): p is HistoryStatus => ALL_STATUSES.includes(p as HistoryStatus));
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export default function ProviderHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  return (
    <RoleGuard allowedRoles={['PROVIDER']}>
      <DashboardHeader title="History" subtitle="Completed, verified, and closed tasks from the last 90 days." />
      <Suspense fallback={<HistoryTableSkeleton />}>
        <HistoryContent searchParams={searchParams} />
      </Suspense>
    </RoleGuard>
  );
}

async function HistoryContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'PROVIDER') redirect('/login');

  const params = await searchParams;
  const statuses = parseStatuses(params.status);
  const requestedPage = parsePage(params.page);

  const result = await getProviderTaskHistory(
    session.user.id,
    { statuses },
    requestedPage,
    PAGE_SIZE,
  );
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const otherParams: Record<string, string> = {};
  if (statuses.length > 0) otherParams.status = statuses.join(',');

  return (
    <div className="flex flex-col gap-6">
      <HistoryFilters active={statuses} />
      <HistoryTable rows={result.rows} hasFilter={statuses.length > 0} />
      <Pagination
        basePath="/provider/history"
        currentPage={result.page}
        totalPages={totalPages}
        otherParams={otherParams}
      />
    </div>
  );
}
