import Decimal from 'decimal.js';
import { cn } from '@/lib/cn';
import { getMonthlySpend, type MonthlySpend } from '../services';

interface Props {
  ownerUserId: string;
}

function formatTzs(amount: Decimal): string {
  return `TZS ${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function abbreviate(amount: Decimal): string {
  const n = amount.toNumber();
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(Math.round(n));
}

const GRID_LEVELS = [0.75, 0.5, 0.25] as const;

export async function MonthlySpendChart({ ownerUserId }: Props) {
  const data: MonthlySpend[] = await getMonthlySpend(ownerUserId);
  const max = data.reduce(
    (m, d) => (d.amount.gt(m) ? d.amount : m),
    new Decimal(0),
  );
  const total = data.reduce((acc, d) => acc.plus(d.amount), new Decimal(0));

  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg shadow-card p-5 h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-h4 font-semibold text-text-primary">Monthly Spend</h3>
          <p className="text-caption text-text-muted">Paid to Oweru · last 6 months</p>
        </div>
        <span className="text-caption text-text-muted tabular-nums">
          6 mo total: {formatTzs(total)}
        </span>
      </div>

      {max.isZero() ? (
        <div className="h-48 flex items-center justify-center text-body-sm text-text-muted">
          No paid invoices in this window.
        </div>
      ) : (
        <div className="flex gap-2 h-48">
          {/* Y-axis labels */}
          <div className="w-10 shrink-0 flex flex-col justify-between pb-5 text-right">
            {GRID_LEVELS.map((lvl) => (
              <span key={lvl} className="text-caption text-text-muted tabular-nums">
                {abbreviate(max.mul(lvl))}
              </span>
            ))}
            <span className="text-caption text-text-muted tabular-nums">0</span>
          </div>

          {/* Chart area */}
          <div className="flex-1 relative">
            {/* Horizontal grid lines */}
            <div className="absolute inset-0 pb-5 flex flex-col justify-between pointer-events-none">
              {GRID_LEVELS.map((lvl) => (
                <div key={lvl} className="border-t border-dashed border-border-subtle" />
              ))}
              <div className="border-t border-border-subtle" />
            </div>

            {/* Bars */}
            <div className="absolute inset-0 pb-5 flex items-end gap-2 px-1">
              {data.map((d, i) => {
                const heightPct = Number(d.amount.div(max).mul(100).toFixed(0));
                const isCurrent = i === data.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-caption font-medium text-text-primary tabular-nums">
                      {d.amountFormatted}
                    </span>
                    <div
                      className={cn(
                        'w-full bg-accent rounded-t-sm transition-all',
                        isCurrent ? 'opacity-100' : 'opacity-70',
                      )}
                      style={{ height: `${heightPct}%`, minHeight: heightPct > 0 ? '4px' : '0' }}
                      title={`${d.monthLabel}: ${d.amountFormatted}`}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex px-1">
              {data.map((d, i) => (
                <span
                  key={i}
                  className="flex-1 text-center text-caption font-medium text-text-muted uppercase tracking-wider"
                >
                  {d.monthLabel}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
