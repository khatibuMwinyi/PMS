import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { Pagination } from '@/shared/components/ui/Pagination';
import type { OwnerServiceRow, OwnerServiceStatus } from '../schemas';

interface Props {
  rows: OwnerServiceRow[];
  currentPage: number;
  totalPages: number;
  basePath: string;
}

const STATUS_BADGE: Record<OwnerServiceStatus, { label: string; bg: string; fg: string }> = {
  PENDING_ASSIGNMENT: {
    label: 'Pending',
    bg: 'bg-[var(--state-info-bg)]',
    fg: 'text-[var(--state-info)]',
  },
  PENDING_ACCEPTANCE: {
    label: 'Awaiting Accept',
    bg: 'bg-[var(--state-info-bg)]',
    fg: 'text-[var(--state-info)]',
  },
  SCHEDULED: {
    label: 'Scheduled',
    bg: 'bg-[var(--state-info-bg)]',
    fg: 'text-[var(--state-info)]',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-[var(--state-warning-bg)]',
    fg: 'text-[var(--state-warning)]',
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-[var(--state-success-bg)]',
    fg: 'text-[var(--state-success)]',
  },
  DISPUTED: {
    label: 'Disputed',
    bg: 'bg-[var(--state-error-bg)]',
    fg: 'text-[var(--state-error)]',
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-[var(--surface-container-high)]',
    fg: 'text-[var(--text-muted)]',
  },
};

function StatusBadge({ status }: { status: OwnerServiceStatus }) {
  const s = STATUS_BADGE[status];
  return (
    <span className={`badge-status ${s.bg} ${s.fg}`}>{s.label}</span>
  );
}

export async function OwnerServicesTable({ rows, currentPage, totalPages, basePath }: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-outline-variant bg-[var(--surface-container-lowest)] p-12 text-center">
        <p className="text-sm text-[var(--text-muted)] mb-3">No services yet.</p>
        <Link
          href="/owner/services/new"
          className="text-sm font-medium text-[var(--brand-gold)] hover:underline"
        >
          Request your first service →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Property</th>
              <th>Service Type</th>
              <th>Status</th>
              <th>Date Requested</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.agreementId}>
                <td className="font-semibold">
                  <Link
                    href={r.hrefDetail}
                    className="text-[var(--text-primary)] hover:text-[var(--brand-gold)]"
                  >
                    {r.shortRef}
                  </Link>
                </td>
                <td>{r.propertyName}</td>
                <td>{r.serviceTypeName}</td>
                <td><StatusBadge status={r.status} /></td>
                <td className="text-[var(--text-muted)]">{r.formattedDate}</td>
                <td className="text-right">
                  <Link
                    href={r.hrefDetail}
                    aria-label="Open details"
                    className="inline-flex p-1 hover:bg-[var(--surface-container-high)] rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <MoreVertical size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        basePath={basePath}
        currentPage={currentPage}
        totalPages={totalPages}
        otherParams={{}}
      />
    </div>
  );
}
