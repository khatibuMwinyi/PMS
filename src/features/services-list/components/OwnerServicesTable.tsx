// src/features/services-list/components/OwnerServicesTable.tsx
import Link from 'next/link';
import { Download, MoreVertical } from 'lucide-react';
import { Pagination } from '@/shared/components/ui/Pagination';
import { StatusBadge } from './StatusBadge';
import type { OwnerServiceRow, OwnerServiceStatus } from '../schemas';

interface Props {
  rows: OwnerServiceRow[];
  currentPage: number;
  totalPages: number;
  basePath: string;
}

function refColorClass(status: OwnerServiceStatus): string {
  if (status === 'DISPUTED') return 'text-state-error';
  if (status === 'CANCELLED' || status === 'COMPLETED') return 'text-text-muted';
  return 'text-accent';
}

function rowBgClass(status: OwnerServiceStatus): string {
  return status === 'DISPUTED' ? 'bg-state-error-bg' : '';
}

export async function OwnerServicesTable({ rows, currentPage, totalPages, basePath }: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface-card p-12 text-center">
        <p className="text-body-sm text-text-muted mb-3">No services yet.</p>
        <Link
          href="/owner/services/new"
          className="text-body-sm font-medium text-accent hover:underline"
        >
          Request your first service →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg overflow-hidden shadow-card">
      <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between gap-4">
        <h3 className="text-h4 font-semibold text-text-primary">Service Requests</h3>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 border border-border-default rounded-md text-caption font-medium text-text-muted hover:bg-surface-overlay transition-colors"
        >
          <Download size={14} /> Export
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-body-sm">
          <thead>
            <tr className="bg-surface-page border-b border-border-subtle">
              {['Ref', 'Property', 'Service Type', 'Status', 'Date Requested', ''].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-2.5 text-caption font-semibold uppercase tracking-widest text-text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.agreementId}
                className={`border-b border-border-subtle last:border-b-0 hover:bg-surface-overlay transition-colors ${rowBgClass(r.status)}`}
              >
                <td className="px-4 py-3">
                  <Link
                    href={r.hrefDetail}
                    className={`font-mono font-bold text-[13px] hover:underline ${refColorClass(r.status)}`}
                  >
                    {r.shortRef}
                  </Link>
                </td>
                <td className="px-4 py-3 text-text-primary font-medium">{r.propertyName}</td>
                <td className="px-4 py-3 text-text-secondary">{r.serviceTypeName}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-text-muted">{r.formattedDate}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={r.hrefDetail}
                    aria-label="Open details"
                    className="inline-flex p-1 hover:bg-surface-overlay rounded text-text-muted hover:text-text-primary"
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
