import { Download } from 'lucide-react';
import { getOwnerInvoicesList, type OwnerInvoiceDisplay } from '../services';

interface Props {
  ownerUserId: string;
}

const STATUS_BADGE: Record<OwnerInvoiceDisplay['status'], { label: string; bg: string; fg: string }> = {
  PAID: {
    label: 'Paid',
    bg: 'bg-[var(--state-success-bg)]',
    fg: 'text-[var(--state-success)]',
  },
  PENDING: {
    label: 'Pending',
    bg: 'bg-[var(--state-warning-bg)]',
    fg: 'text-[var(--state-warning)]',
  },
  OVERDUE: {
    label: 'Overdue',
    bg: 'bg-[var(--state-error-bg)]',
    fg: 'text-[var(--state-error)]',
  },
  FAILED: {
    label: 'Failed',
    bg: 'bg-[var(--state-error-bg)]',
    fg: 'text-[var(--state-error)]',
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-[var(--surface-container-high)]',
    fg: 'text-[var(--text-muted)]',
  },
};

export async function OwnerInvoicesTable({ ownerUserId }: Props) {
  const rows = await getOwnerInvoicesList(ownerUserId);

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-outline-variant bg-[var(--surface-container-lowest)] p-12 text-center">
        <p className="text-sm text-[var(--text-muted)]">No invoices yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md overflow-hidden">
      <div className="p-4 border-b border-outline-variant flex justify-between items-center">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          Invoices &amp; Payment History
        </h3>
        <span className="text-xs text-[var(--text-muted)]">
          {rows.length} invoice{rows.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Property</th>
              <th>Service</th>
              <th>Date</th>
              <th className="text-right">Amount</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const s = STATUS_BADGE[r.status];
              const payable = r.status === 'PENDING' || r.status === 'OVERDUE' || r.status === 'FAILED';
              return (
                <tr key={r.id}>
                  <td className="font-semibold">{r.shortRef}</td>
                  <td>{r.propertyName}</td>
                  <td>{r.serviceTypeName}</td>
                  <td className="text-[var(--text-muted)]">{r.dateFormatted}</td>
                  <td className="text-right tabular-nums">{r.amountFormatted}</td>
                  <td>
                    <span className={`badge-status ${s.bg} ${s.fg}`}>{s.label}</span>
                    {r.attempts > 0 && r.status !== 'PAID' && (
                      <span className="ml-2 text-[10px] text-[var(--text-muted)]">
                        {r.attempts}/3 attempts
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    {payable ? (
                      <button
                        type="button"
                        className="px-3 py-1 bg-[var(--brand-gold)] text-[var(--brand-primary)] rounded text-xs font-semibold hover:bg-[var(--brand-gold-dark)] transition-colors"
                      >
                        Pay via Selcom
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label="Download receipt"
                        className="inline-flex p-1 hover:bg-[var(--surface-container-high)] rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        <Download size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
