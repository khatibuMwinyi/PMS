'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import type { OwnerInvoiceDisplay } from '../services';

type FilterValue = 'ALL' | 'PENDING' | 'OVERDUE' | 'FAILED' | 'PAID';

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Paid', value: 'PAID' },
];

const STATUS_BADGE: Record<
  OwnerInvoiceDisplay['status'],
  { label: string; bg: string; fg: string }
> = {
  PAID:      { label: 'Paid',      bg: 'bg-state-success-bg', fg: 'text-state-success' },
  PENDING:   { label: 'Pending',   bg: 'bg-state-warning-bg', fg: 'text-state-warning' },
  OVERDUE:   { label: 'Overdue',   bg: 'bg-state-error-bg',   fg: 'text-state-error' },
  FAILED:    { label: 'Failed',    bg: 'bg-state-error-bg',   fg: 'text-state-error' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-surface-overlay',  fg: 'text-text-muted' },
};

interface Props {
  rows: OwnerInvoiceDisplay[];
}

export function OwnerInvoicesClient({ rows }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('ALL');

  const filtered =
    activeFilter === 'ALL' ? rows : rows.filter((r) => r.status === activeFilter);

  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg overflow-hidden shadow-card">
      {/* Header + filter pills */}
      <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-h4 font-semibold text-text-primary">
          Invoices &amp; Payment History
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setActiveFilter(f.value)}
              className={
                activeFilter === f.value
                  ? 'px-3 py-1 rounded-full text-caption font-semibold bg-primary text-white'
                  : 'px-3 py-1 rounded-full text-caption font-semibold border border-border-default text-text-muted hover:bg-surface-overlay transition-colors'
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-body-sm text-text-muted">No invoices match this filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-page">
                {['Reference', 'Property · Service', 'Date', 'Amount', 'Status', 'Action'].map(
                  (col, i) => (
                    <th
                      key={col}
                      className={`px-4 py-2.5 text-caption font-semibold uppercase tracking-widest text-text-muted border-b border-border-subtle ${
                        i >= 3 ? 'text-right' : 'text-left'
                      } ${i === 4 ? 'text-left' : ''}`}
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const badge = STATUS_BADGE[r.status];
                const payable =
                  r.status === 'PENDING' ||
                  r.status === 'OVERDUE' ||
                  r.status === 'FAILED';
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-surface-overlay transition-colors border-b border-border-subtle last:border-b-0"
                  >
                    <td className="px-4 py-3 font-mono text-body-sm font-semibold text-text-primary">
                      {r.shortRef}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{r.propertyName}</div>
                      <div className="text-caption text-text-muted">{r.serviceTypeName}</div>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{r.dateFormatted}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-text-primary">
                      {r.amountFormatted}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-semibold ${badge.bg} ${badge.fg}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                        {badge.label}
                      </span>
                      {r.attempts > 0 && r.status !== 'PAID' && (
                        <span className="ml-2 text-[10px] text-text-muted">{r.attempts}/3</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {payable ? (
                        <button
                          type="button"
                          className="px-3 py-1 bg-accent text-accent-foreground rounded text-caption font-semibold hover:bg-accent-dark transition-colors"
                        >
                          Pay via Selcom
                        </button>
                      ) : (
                        <a
                          href={`/api/invoices/${r.id}/receipt`}
                          aria-label="Download receipt"
                          className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-text-primary transition-colors"
                        >
                          <Download size={14} />
                          Receipt
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
