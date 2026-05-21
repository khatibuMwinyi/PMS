import { Pagination } from '@/shared/components/ui/Pagination';
import type { UtilityBillRow } from '../services';

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

const COLUMNS = [
  { label: 'Property',   align: 'text-left'  },
  { label: 'Type',       align: 'text-left'  },
  { label: 'Period',     align: 'text-left'  },
  { label: 'Allocation', align: 'text-left'  },
  { label: 'Amount',     align: 'text-right' },
  { label: 'Recorded',   align: 'text-left'  },
] as const;

interface Props {
  rows: UtilityBillRow[];
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export async function UtilityTable({ rows, currentPage, totalPages, basePath }: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-subtle bg-surface-card p-8 text-center">
        <p className="text-body-sm text-text-muted">No utility bills recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg overflow-hidden shadow-card">
      <div className="px-5 py-3 border-b border-border-subtle">
        <h2 className="text-h4 font-semibold text-text-primary">Recorded Bills</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-body-sm">
          <thead>
            <tr className="bg-surface-page">
              {COLUMNS.map(({ label, align }) => (
                <th
                  key={label}
                  className={`px-4 py-2.5 ${align} text-caption font-semibold uppercase tracking-widest text-text-muted border-b border-border-subtle`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-surface-overlay transition-colors border-b border-border-subtle last:border-b-0"
              >
                <td className="px-4 py-3 font-medium text-text-primary">{r.propertyName}</td>
                <td className="px-4 py-3 text-text-secondary">{TYPE_LABEL[r.type] ?? r.type}</td>
                <td className="px-4 py-3 tabular-nums text-text-secondary">{r.billingPeriod}</td>
                <td className="px-4 py-3 text-text-muted">
                  {ALLOCATION_LABEL[r.allocationMethod] ?? r.allocationMethod}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-text-primary">
                  {r.amountFormatted}
                </td>
                <td className="px-4 py-3 text-text-muted">{r.createdAtFormatted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        basePath={basePath}
        currentPage={currentPage}
        totalPages={totalPages}
        otherParams={{}}
      />
    </div>
  );
}
