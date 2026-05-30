import { getOwnerServiceKpis } from '../services';

interface Props {
  ownerUserId: string;
}

interface CardProps {
  label: string;
  value: number;
  hint?: string;
  accent?: 'default' | 'danger';
}

function KpiCell({ label, value, hint, accent = 'default' }: CardProps) {
  return (
    <div
      className={[
        'bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-4 flex flex-col gap-1',
        accent === 'danger' ? 'border-l-4 border-l-[var(--state-error)]' : '',
      ].join(' ')}
    >
      <span className="text-body font-medium text-[var(--text-muted)] uppercase tracking-wider">
        {label}
      </span>
      <div className="flex justify-between items-end">
        <span
          className={[
            'text-[28px] leading-8 font-semibold tabular-nums',
            accent === 'danger' ? 'text-[var(--state-error)]' : 'text-[var(--text-primary)]',
          ].join(' ')}
        >
          {value}
        </span>
        {hint && (
          <span className="text-[11px] font-medium text-[var(--text-muted)]">{hint}</span>
        )}
      </div>
    </div>
  );
}

export async function OwnerServicesKpis({ ownerUserId }: Props) {
  const k = await getOwnerServiceKpis(ownerUserId);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <KpiCell label="Total Active" value={k.activeCount} />
      <KpiCell label="Scheduled" value={k.scheduledCount} hint="Upcoming" />
      <KpiCell label="In Progress" value={k.inProgressCount} hint="On track" />
      <KpiCell label="Disputed" value={k.disputedCount} accent="danger" hint="Action required" />
    </div>
  );
}
