// src/features/services-list/components/OwnerServicesTable.tsx
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
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
  if (status === 'DISPUTED') return 'text-[var(--state-error)]';
  if (status === 'CANCELLED' || status === 'COMPLETED') return 'text-[var(--text-muted)]';
  return 'text-[var(--brand-gold)]';
}

function rowBgClass(status: OwnerServiceStatus): string {
  return status === 'DISPUTED' ? 'bg-[#FFF5F5]' : '';
}

export async function OwnerServicesTable({ rows, currentPage, totalPages, basePath }: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-12 text-center">
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
    <div
      className="bg-white border border-[var(--outline-variant)] rounded-lg overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-[var(--outline-variant)]">
              {['Ref', 'Property', 'Service Type', 'Status', 'Date Requested', ''].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[.06em] text-[#94A3B8]"
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
                className={`border-b border-[var(--outline-variant)] last:border-0 hover:bg-[var(--surface-container-lowest)] transition-colors ${rowBgClass(r.status)}`}
              >
                <td className="px-4 py-3">
                  <Link
                    href={r.hrefDetail}
                    className={`font-mono font-bold text-[13px] hover:underline ${refColorClass(r.status)}`}
                  >
                    {r.shortRef}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{r.propertyName}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{r.serviceTypeName}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-[11px] text-[#94A3B8]">{r.formattedDate}</td>
                <td className="px-4 py-3 text-right">
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
