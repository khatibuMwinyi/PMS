import Link from 'next/link';
import { getPropertyCostBreakdown } from '../services';

interface Props {
  ownerUserId: string;
}

export async function PropertyCostTable({ ownerUserId }: Props) {
  const rows = await getPropertyCostBreakdown(ownerUserId);

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-outline-variant bg-[var(--surface-container-lowest)] p-12 text-center">
        <p className="text-sm text-[var(--text-muted)]">No property data yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md overflow-hidden">
      <div className="p-4 border-b border-outline-variant flex justify-between items-center">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">Per-Property Costs (YTD)</h3>
        <span className="text-xs text-[var(--text-muted)]">{rows.length} properties</span>
      </div>
      <div className="overflow-x-auto">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Zone</th>
              <th className="text-right">Services Paid</th>
              <th className="text-right">Utilities</th>
              <th className="text-right">Total</th>
              <th className="text-right">Services Count</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.propertyId}>
                <td className="font-semibold">
                  <Link
                    href={`/owner/properties/${r.propertyId}`}
                    className="text-[var(--text-primary)] hover:text-[var(--brand-gold)]"
                  >
                    {r.propertyName}
                  </Link>
                </td>
                <td className="text-[var(--text-muted)]">{r.zone}</td>
                <td className="text-right tabular-nums">{r.servicesYtdFormatted}</td>
                <td className="text-right tabular-nums text-[var(--text-muted)]">
                  {r.utilityYtdFormatted}
                </td>
                <td className="text-right tabular-nums font-semibold">{r.totalYtdFormatted}</td>
                <td className="text-right tabular-nums">{r.serviceCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
