import { getServiceMix } from '../services';

interface Props {
  ownerUserId: string;
}

export async function ServiceMixChart({ ownerUserId }: Props) {
  const mix = await getServiceMix(ownerUserId);

  return (
    <div className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-5 h-full">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">Service Mix</h3>
        <p className="text-xs text-[var(--text-muted)]">Share of total spend by service type</p>
      </div>

      {mix.length === 0 ? (
        <div className="flex items-center justify-center text-sm text-[var(--text-muted)] py-8">
          No spend data yet.
        </div>
      ) : (
        <div className="space-y-3">
          {mix.map((m) => (
            <div key={m.serviceTypeName} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[var(--text-primary)]">{m.serviceTypeName}</span>
                <span className="tabular-nums text-[var(--text-muted)]">
                  {m.pct}% · {m.amountFormatted}
                </span>
              </div>
              <div className="h-2 bg-[var(--surface-container-high)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--brand-primary)] rounded-full"
                  style={{ width: `${m.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
