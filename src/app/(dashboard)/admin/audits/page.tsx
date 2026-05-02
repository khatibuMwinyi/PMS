import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { getAllAuditEvents, getAuditStats } from '@/features/audits/queries';
import { AuditLogViewer } from '@/features/audits/components/AuditLogViewer';

export default async function AdminAuditsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    entityType?: string;
    action?: string;
    page?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const pageSize = 20;

  const filters = {
    entityType: params.entityType || undefined,
    action: params.action || undefined,
    page,
    pageSize,
  };

  const [auditData, stats] = await Promise.all([
    getAllAuditEvents(filters),
    getAuditStats(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Audit Log
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Track all system actions with full audit trail
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface-card)] rounded-lg border border-[var(--border-subtle)] p-4">
          <p className="text-sm text-[var(--text-muted)]">Total Events</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
            {stats.total}
          </p>
        </div>
        <div className="bg-[var(--surface-card)] rounded-lg border border-[var(--border-subtle)] p-4">
          <p className="text-sm text-[var(--text-muted)]">Creates</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats.byAction.CREATE || 0}
          </p>
        </div>
        <div className="bg-[var(--surface-card)] rounded-lg border border-[var(--border-subtle)] p-4">
          <p className="text-sm text-[var(--text-muted)]">Updates</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {stats.byAction.UPDATE || 0}
          </p>
        </div>
        <div className="bg-[var(--surface-card)] rounded-lg border border-[var(--border-subtle)] p-4">
          <p className="text-sm text-[var(--text-muted)]">Status Changes</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {stats.byAction.STATUS_CHANGE || 0}
          </p>
        </div>
      </div>

      {/* Audit Log Viewer */}
      <AuditLogViewer
        initialEvents={auditData.events}
        initialPagination={auditData.pagination}
        stats={stats}
        filters={filters}
      />
    </div>
  );
}
