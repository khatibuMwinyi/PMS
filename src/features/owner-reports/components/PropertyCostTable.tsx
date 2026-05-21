import Link from 'next/link';
import { getPropertyCostBreakdown } from '../services';

interface Props {
  ownerUserId: string;
}

export async function PropertyCostTable({ ownerUserId }: Props) {
  const rows = await getPropertyCostBreakdown(ownerUserId);

  return (
    <>
      {/* Section divider */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-caption font-semibold uppercase tracking-widest text-text-muted whitespace-nowrap">
          Per-Property Cost Breakdown
        </span>
        <hr className="flex-1 border-border-subtle" />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-subtle bg-surface-card p-12 text-center">
          <p className="text-body-sm text-text-muted">No spending data yet.</p>
        </div>
      ) : (
        <div className="bg-surface-card border border-border-subtle rounded-lg overflow-hidden shadow-card">
          <div className="px-5 py-3 border-b border-border-subtle flex justify-between items-center">
            <h3 className="text-h4 font-semibold text-text-primary">Per-Property Costs (YTD)</h3>
            <span className="text-caption text-text-muted">
              {rows.length} {rows.length === 1 ? 'property' : 'properties'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-body-sm">
              <thead>
                <tr className="bg-surface-page">
                  {[
                    { label: 'Property',      align: 'left' },
                    { label: 'Zone',          align: 'left' },
                    { label: 'Services Paid', align: 'right' },
                    { label: 'Utilities',     align: 'right' },
                    { label: 'Total',         align: 'right' },
                    { label: 'Count',         align: 'right' },
                  ].map(({ label, align }) => (
                    <th
                      key={label}
                      className={`px-4 py-2.5 text-${align} text-caption font-semibold uppercase tracking-widest text-text-muted border-b border-border-subtle`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.propertyId}
                    className="hover:bg-surface-overlay transition-colors border-b border-border-subtle last:border-b-0"
                  >
                    <td className="px-4 py-3 font-semibold">
                      <Link
                        href={`/owner/properties/${r.propertyId}`}
                        className="text-text-primary hover:text-accent transition-colors"
                      >
                        {r.propertyName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{r.zone}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                      {r.servicesYtdFormatted}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-muted">
                      {r.utilityYtdFormatted}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-text-primary">
                      {r.totalYtdFormatted}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-muted">
                      {r.serviceCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
