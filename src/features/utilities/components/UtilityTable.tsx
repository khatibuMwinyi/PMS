import { getOwnerUtilities } from '../services';

const TYPE_LABEL: Record<string, string> = {
  WATER: 'Water',
  ELECTRICITY: 'Electricity',
  GAS: 'Gas',
  WASTE: 'Waste',
};

const ALLOCATION_LABEL: Record<string, string> = {
  PER_UNIT: 'Per unit',
  PER_PERSON: 'Per person',
  PER_SQM: 'Per sqm',
};

export async function UtilityTable({ ownerUserId }: { ownerUserId: string }) {
  const rows = await getOwnerUtilities(ownerUserId);

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-outline-variant bg-[var(--surface-container-lowest)] p-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">No utility bills recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md overflow-hidden">
      <div className="p-4 border-b border-outline-variant">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Recorded bills</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Type</th>
              <th>Period</th>
              <th>Allocation</th>
              <th className="text-right">Amount</th>
              <th>Recorded</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.propertyName}</td>
                <td>{TYPE_LABEL[r.type] ?? r.type}</td>
                <td className="tabular-nums">{r.billingPeriod}</td>
                <td className="text-[var(--text-muted)]">
                  {ALLOCATION_LABEL[r.allocationMethod] ?? r.allocationMethod}
                </td>
                <td className="text-right tabular-nums">{r.amountFormatted}</td>
                <td className="text-[var(--text-muted)]">{r.createdAtFormatted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
