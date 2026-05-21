import { getOwnerFinancialsSummary } from '../services';

interface Props {
  ownerUserId: string;
}

export async function OwnerFinancialsSummary({ ownerUserId }: Props) {
  const s = await getOwnerFinancialsSummary(ownerUserId);

  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden bg-surface-card shadow-card mb-6 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-subtle">

      {/* Tile 1 — Paid YTD */}
      <div className="border-t-[3px] border-t-accent p-5">
        <p className="text-caption font-semibold uppercase tracking-widest text-text-muted mb-3">
          Paid to Oweru (YTD)
        </p>
        <p className="text-[28px] font-serif leading-none text-text-primary tabular-nums">
          {s.paidYtdFormatted}
        </p>
        <p className="text-caption text-text-muted mt-2">
          Jan {new Date().getFullYear()} – present
        </p>
      </div>

      {/* Tile 2 — Pending */}
      <div className="border-t-[3px] border-t-state-error p-5">
        <p className="text-caption font-semibold uppercase tracking-widest text-text-muted mb-3">
          Pending Invoices
        </p>
        <p className="text-[28px] font-serif leading-none text-text-primary tabular-nums">
          {String(s.pendingCount).padStart(2, '0')}
          <span className="text-body font-normal text-text-muted ml-2">
            invoice{s.pendingCount === 1 ? '' : 's'}
          </span>
        </p>
        <p className="text-body-sm font-semibold text-state-error tabular-nums mt-2">
          {s.pendingFormatted} outstanding
        </p>
        {s.nextDueFormatted && (
          <p className="text-caption text-text-muted italic mt-1">
            Next due: {s.nextDueFormatted}
          </p>
        )}
      </div>

      {/* Tile 3 — Utility YTD */}
      <div className="border-t-[3px] border-t-state-success p-5">
        <p className="text-caption font-semibold uppercase tracking-widest text-text-muted mb-3">
          Utility Expenses (YTD)
        </p>
        <p className="text-[28px] font-serif leading-none text-text-primary tabular-nums">
          {s.utilityYtdFormatted}
        </p>
        <p className="text-caption text-text-muted mt-2">
          Tracked separately from Oweru services
        </p>
      </div>
    </div>
  );
}
