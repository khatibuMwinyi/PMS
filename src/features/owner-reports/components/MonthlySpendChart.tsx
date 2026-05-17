import Decimal from 'decimal.js';
import { getMonthlySpend, type MonthlySpend } from '../services';

interface Props {
  ownerUserId: string;
}

function formatTzs(amount: Decimal): string {
  return `TZS ${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export async function MonthlySpendChart({ ownerUserId }: Props) {
  const data: MonthlySpend[] = await getMonthlySpend(ownerUserId);
  const max = data.reduce(
    (m, d) => (d.amount.gt(m) ? d.amount : m),
    new Decimal(0),
  );
  const total = data.reduce((acc, d) => acc.plus(d.amount), new Decimal(0));

  return (
    <div className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-5 h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Monthly Spend</h3>
          <p className="text-xs text-[var(--text-muted)]">
            Paid to Oweru, last 6 months
          </p>
        </div>
        <span className="text-xs text-[var(--text-muted)] tabular-nums">
          6 mo total: {formatTzs(total)}
        </span>
      </div>

      {max.isZero() ? (
        <div className="h-48 flex items-center justify-center text-sm text-[var(--text-muted)]">
          No paid invoices in this window.
        </div>
      ) : (
        <>
          <div className="flex items-end gap-2 h-48 px-2">
            {data.map((d, i) => {
              const heightPct = max.isZero()
                ? 0
                : Number(d.amount.div(max).mul(100).toFixed(0));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium text-[var(--text-primary)] tabular-nums">
                    {d.amountFormatted}
                  </span>
                  <div
                    className="w-full bg-[var(--brand-gold)] rounded-t-sm transition-all"
                    style={{ height: `${heightPct}%`, minHeight: heightPct > 0 ? '4px' : '0' }}
                    aria-label={`${d.monthLabel}: ${d.amountFormatted}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 px-2 text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
            {data.map((d, i) => (
              <span key={i} className="flex-1 text-center">{d.monthLabel}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
