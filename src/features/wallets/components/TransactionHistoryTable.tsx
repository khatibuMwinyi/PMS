import { formatTZS } from '@/shared/lib/currency';
import type { WalletSummary } from '../types';

type Tx = WalletSummary['transactions'][number];

function netAmount(t: Tx): number {
  return t.amount;
}

function statusClass(s: string): string {
  if (s === 'SETTLED') return 'bg-[var(--state-success-bg)] text-[var(--state-success)]';
  if (s === 'PENDING') return 'bg-[var(--state-warning-bg)] text-[var(--state-warning)]';
  if (s === 'FAILED')  return 'bg-[var(--state-error-bg)] text-[var(--state-error)]';
  return 'bg-[var(--surface-overlay)] text-[var(--text-secondary)]';
}

function typeLabel(t: Tx['type']): string {
  switch (t) {
    case 'EARNING':    return 'Service Earning';
    case 'WITHDRAWAL': return 'Withdrawal';
    case 'PENALTY':    return 'Penalty';
    case 'ADJUSTMENT': return 'Adjustment';
    default:           return t;
  }
}

export function TransactionHistoryTable({ transactions }: { transactions: Tx[] }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-body-sm text-[var(--text-muted)]">
        No transactions yet — your first service earning will appear here.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-[var(--surface-page)] border-b border-[var(--border-subtle)]">
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Date</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Type</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Reference</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Status</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2 text-right">Amount</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2 text-right">Balance</th>
          </tr>
        </thead>
        <tbody className="text-body-sm text-[var(--text-primary)] tabular-nums">
          {transactions.map((t, idx) => (
            <tr
              key={t.id}
              className={`border-b border-[var(--border-subtle)] hover:bg-[var(--surface-page)] transition-colors ${idx % 2 === 1 ? 'bg-[var(--surface-page)]' : ''}`}
            >
              <td className="px-3 py-2 whitespace-nowrap text-[var(--text-secondary)]">
                {new Date(t.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
              </td>
              <td className="px-3 py-2 font-medium">{typeLabel(t.type)}</td>
              <td className="px-3 py-2 text-[var(--text-muted)]">{t.reference.slice(0, 12).toUpperCase()}</td>
              <td className="px-3 py-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-label font-semibold ${statusClass(t.status)}`}>
                  {t.status}
                </span>
              </td>
              <td className={`px-3 py-2 text-right font-semibold ${netAmount(t) < 0 ? 'text-[var(--state-error)]' : ''}`}>
                {formatTZS(netAmount(t))}
              </td>
              <td className="px-3 py-2 text-right text-[var(--text-secondary)]">{formatTZS(t.runningBalance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
