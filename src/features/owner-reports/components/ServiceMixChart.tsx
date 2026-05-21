import { getServiceMix } from '../services';

interface Props {
  ownerUserId: string;
}

export async function ServiceMixChart({ ownerUserId }: Props) {
  const mix = await getServiceMix(ownerUserId);

  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg shadow-card p-5 h-full">
      <div className="mb-4">
        <h3 className="text-h4 font-semibold text-text-primary">Service Mix</h3>
        <p className="text-caption text-text-muted">Share of total spend by service type</p>
      </div>

      {mix.length === 0 ? (
        <div className="flex items-center justify-center text-body-sm text-text-muted py-8">
          No spend data yet.
        </div>
      ) : (
        <div className="space-y-4">
          {mix.map((m) => (
            <div key={m.serviceTypeName}>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-body-sm font-medium text-text-primary">
                  {m.serviceTypeName}
                </span>
                <div className="text-right">
                  <span className="text-body-sm font-semibold tabular-nums text-text-primary">
                    {m.amountFormatted}
                  </span>
                  <span className="text-caption text-text-muted ml-1">{m.pct}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-surface-overlay rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
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
