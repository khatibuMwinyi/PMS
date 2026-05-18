import Link from 'next/link';
import { ClipboardCheck } from 'lucide-react';
import { formatTZS } from '@/shared/lib/currency';
import type { HistoryRow, HistoryStatus } from '../queries';

const STATUS_BADGE: Record<HistoryStatus, string> = {
  COMPLETED: 'bg-[var(--surface-overlay)] text-[var(--text-secondary)]',
  VERIFIED:  'bg-[var(--state-success-bg)] text-[var(--state-success)]',
  DISPUTED:  'bg-[var(--state-warning-bg)] text-[var(--state-warning)]',
  OVERDUE:   'bg-[var(--state-error-bg)] text-[var(--state-error)]',
  CANCELLED: 'bg-[var(--state-error-bg)] text-[var(--state-error)]',
};

const STATUS_LABEL: Record<HistoryStatus, string> = {
  COMPLETED: 'Completed',
  VERIFIED:  'Verified',
  DISPUTED:  'Disputed',
  OVERDUE:   'Overdue',
  CANCELLED: 'Cancelled',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

interface Props {
  rows: HistoryRow[];
  hasFilter: boolean;
}

export function HistoryTable({ rows, hasFilter }: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)] p-12 text-center flex flex-col items-center gap-3">
        <ClipboardCheck size={28} className="text-[var(--text-muted)]" />
        {hasFilter ? (
          <>
            <h2 className="text-h2 font-semibold text-[var(--text-primary)]">No matches for current filters</h2>
            <p className="text-body-sm text-[var(--text-muted)]">Try clearing a status to see more results.</p>
          </>
        ) : (
          <>
            <h2 className="text-h2 font-semibold text-[var(--text-primary)]">No history yet</h2>
            <p className="text-body-sm text-[var(--text-muted)]">Completed and verified tasks will appear here once you finish your first job.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--surface-card)] overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-[var(--surface-page)] border-b border-[var(--border-subtle)]">
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Date</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Task</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Service</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Zone</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2 text-right">Payout</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="text-body-sm text-[var(--text-primary)] tabular-nums">
          {rows.map((r, i) => (
            <tr
              key={r.id}
              className={`border-b border-[var(--border-subtle)] hover:bg-[var(--surface-page)] ${i % 2 === 1 ? 'bg-[var(--surface-page)]' : ''}`}
            >
              <td className="px-3 py-2 whitespace-nowrap text-[var(--text-secondary)]">{formatDate(r.scheduledFor)}</td>
              <td className="px-3 py-2 text-[var(--text-secondary)]">
                <Link href={`/provider/tasks/${r.id}`} className="hover:underline">
                  #{r.id.slice(0, 6).toUpperCase()}
                </Link>
              </td>
              <td className="px-3 py-2 font-medium">{r.serviceTypeName}</td>
              <td className="px-3 py-2 text-[var(--text-secondary)]">{r.zone}</td>
              <td className="px-3 py-2 text-right">{formatTZS(r.providerPayoutTZS)}</td>
              <td className="px-3 py-2 text-right">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-label font-semibold ${STATUS_BADGE[r.uiStatus]}`}>
                  {STATUS_LABEL[r.uiStatus]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HistoryTableSkeleton() {
  return (
    <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--surface-card)] p-4 flex flex-col gap-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} data-skeleton="row" className="h-8 w-full rounded animate-pulse bg-[var(--surface-overlay)]" />
      ))}
    </div>
  );
}
