import { Bolt, AlertCircle, Wallet } from 'lucide-react';
import { getOwnerFinancialsSummary } from '../services';

interface Props {
  ownerUserId: string;
}

export async function OwnerFinancialsSummary({ ownerUserId }: Props) {
  const s = await getOwnerFinancialsSummary(ownerUserId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between mb-3">
          <span className="font-label text-[var(--text-muted)] uppercase tracking-wider">
            Paid to Oweru (YTD)
          </span>
          <Wallet size={18} className="text-[var(--text-muted)]" />
        </div>
        <p className="text-[26px] font-semibold tabular-nums text-[var(--text-primary)]">
          {s.paidYtdFormatted}
        </p>
      </div>

      <div className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="font-label text-[var(--text-muted)] uppercase tracking-wider">
            Pending Invoices
          </span>
          <AlertCircle size={18} className="text-[var(--state-error)]" />
        </div>
        <p className="text-[18px] font-semibold tabular-nums text-[var(--text-primary)]">
          {String(s.pendingCount).padStart(2, '0')}{' '}
          <span className="text-[13px] font-normal text-[var(--text-muted)]">
            invoice{s.pendingCount === 1 ? '' : 's'} pending
          </span>
        </p>
        <p className="text-sm font-semibold text-[var(--state-error)] tabular-nums mt-1">
          {s.pendingFormatted}
        </p>
        {s.nextDueFormatted && (
          <p className="text-[11px] text-[var(--text-muted)] italic mt-1">
            Next due: {s.nextDueFormatted}
          </p>
        )}
      </div>

      <div className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-5 relative overflow-hidden">
        <div className="flex items-start justify-between mb-3">
          <span className="font-label text-[var(--text-muted)] uppercase tracking-wider">
            Utility Expenses (YTD)
          </span>
          <Bolt size={18} className="text-[var(--text-muted)]" />
        </div>
        <p className="text-[26px] font-semibold tabular-nums text-[var(--text-primary)]">
          {s.utilityYtdFormatted}
        </p>
        <p className="text-[11px] text-[var(--text-muted)] mt-1">
          Tracked separately from Oweru services.
        </p>
      </div>
    </div>
  );
}
