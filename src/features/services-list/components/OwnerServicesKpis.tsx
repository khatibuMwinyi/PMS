import { getOwnerServiceKpis } from '../services';

interface Props {
  ownerUserId: string;
}

interface KpiTileProps {
  label: string;
  value: number;
  topBorderClass: string;
  numberColorClass: string;
  bgClass?: string;
}

function KpiTile({ label, value, topBorderClass, numberColorClass, bgClass = '' }: KpiTileProps) {
  return (
    <div className={`border-t-[3px] p-5 ${topBorderClass} ${bgClass}`}>
      <p className="text-caption font-semibold uppercase tracking-widest text-text-muted mb-3">
        {label}
      </p>
      <p className={`text-[28px] font-serif leading-none tabular-nums ${numberColorClass}`}>
        {value}
      </p>
    </div>
  );
}

export async function OwnerServicesKpis({ ownerUserId }: Props) {
  const k = await getOwnerServiceKpis(ownerUserId);
  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden bg-surface-card shadow-card grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
      <KpiTile
        label="Total Active"
        value={k.activeCount}
        topBorderClass="border-t-accent"
        numberColorClass="text-accent"
      />
      <KpiTile
        label="Scheduled"
        value={k.scheduledCount}
        topBorderClass="border-t-[var(--status-scheduled)]"
        numberColorClass="text-text-primary"
      />
      <KpiTile
        label="In Progress"
        value={k.inProgressCount}
        topBorderClass="border-t-state-warning"
        numberColorClass="text-text-primary"
      />
      <KpiTile
        label="Disputed"
        value={k.disputedCount}
        topBorderClass="border-t-state-error"
        numberColorClass="text-state-error"
        bgClass="bg-state-error-bg"
      />
    </div>
  );
}
