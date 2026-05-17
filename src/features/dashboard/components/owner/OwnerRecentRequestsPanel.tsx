// src/features/dashboard/components/owner/OwnerRecentRequestsPanel.tsx
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { getOwnerRecentRequests } from '@/features/dashboard/queries/owner';
import type {
  OwnerRecentRequest, StatusVariant,
} from '@/features/dashboard/schemas/owner-dashboard.schema';

interface Props {
  ownerUserId: string;
  limit?: number;
}

const STATUS_BADGE_CLASS: Record<StatusVariant, string> = {
  urgent:    'bg-[var(--state-error)]/10 text-[var(--state-error)]',
  progress:  'bg-[var(--state-info)]/10 text-[var(--state-info)]',
  scheduled: 'bg-[var(--text-muted)]/10 text-[var(--text-muted)]',
  complete:  'bg-[var(--state-success)]/10 text-[var(--state-success)]',
  neutral:   'bg-[var(--border-subtle)] text-[var(--text-muted)]',
};

const STATUS_LABEL: Record<OwnerRecentRequest['status'], string> = {
  PENDING_ASSIGNMENT: 'Pending',
  PENDING_ACCEPTANCE: 'Pending Accept',
  SCHEDULED:          'Scheduled',
  IN_PROGRESS:        'In Progress',
  COMPLETED:          'Completed',
  DISPUTED:           'Disputed',
  CANCELLED:          'Cancelled',
};

function RequestItem({ r }: { r: OwnerRecentRequest }) {
  return (
    <li className="p-4 hover:bg-[var(--surface-overlay)] transition-colors">
      <Link href={r.hrefDetail} className="block">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium text-[var(--text-primary)]">{r.serviceTypeName}</span>
          <span
            className={cn(
              'text-[10px] font-bold uppercase px-2 py-1 rounded',
              STATUS_BADGE_CLASS[r.statusVariant],
            )}
          >
            {STATUS_LABEL[r.status]}
          </span>
        </div>
        <p className="text-body-sm text-[var(--text-secondary)] mb-2">{r.propertyName}</p>
        <div className="flex items-center gap-2 text-[12px] text-[var(--text-muted)] tabular-nums">
          <Clock size={12} />
          <span>{r.ageHuman}</span>
        </div>
      </Link>
    </li>
  );
}

export function RecentRequestsEmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 text-center">
      <p className="text-body-sm text-[var(--text-muted)]">No recent requests.</p>
    </div>
  );
}

export async function OwnerRecentRequestsPanel({ ownerUserId, limit = 5 }: Props) {
  const requests = await getOwnerRecentRequests(ownerUserId, limit);

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-h2 font-semibold text-[var(--text-primary)]">Recent Requests</h3>
      </div>
      {requests.length === 0 ? (
        <RecentRequestsEmptyState />
      ) : (
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]">
          <ul className="divide-y divide-[var(--border-subtle)]">
            {requests.map((r) => <RequestItem key={r.agreementId} r={r} />)}
          </ul>
          <div className="p-3 border-t border-[var(--border-subtle)] text-center">
            <Link href="/owner/services" className="text-label text-[var(--brand-gold)] hover:underline">
              View All Activity
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
