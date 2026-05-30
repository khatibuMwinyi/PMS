import { getOwnerServiceKpis } from '../services';

interface Props {
  ownerUserId: string;
}

interface KpiCellProps {
  label: string;
  value: number;
  borderColor: string;   // CSS value, e.g. 'var(--brand-gold)'
  numberColor: string;   // CSS value, e.g. 'var(--brand-gold)'
  bgColor?: string;      // CSS value, e.g. 'var(--state-error-bg)' — defaults to white
}

function KpiCell({ label, value, borderColor, numberColor, bgColor = '#ffffff' }: KpiCellProps) {
  return (
    <div
      className="border border-[var(--outline-variant)] rounded-md p-4 flex flex-col gap-1"
      style={{ borderLeftWidth: '3px', borderLeftColor: borderColor, backgroundColor: bgColor }}
    >
      <span className="text-[10px] font-medium uppercase tracking-[.05em] text-[#94A3B8]">
        {label}
      </span>
      <span
        className="text-[26px] font-bold tabular-nums leading-tight"
        style={{ color: numberColor }}
      >
        {value}
      </span>
    </div>
  );
}

export async function OwnerServicesKpis({ ownerUserId }: Props) {
  const k = await getOwnerServiceKpis(ownerUserId);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <KpiCell
        label="Total Active"
        value={k.activeCount}
        borderColor="var(--brand-gold)"
        numberColor="var(--brand-gold)"
      />
      <KpiCell
        label="Scheduled"
        value={k.scheduledCount}
        borderColor="var(--status-scheduled)"
        numberColor="var(--text-primary)"
      />
      <KpiCell
        label="In Progress"
        value={k.inProgressCount}
        borderColor="var(--state-warning)"
        numberColor="var(--text-primary)"
      />
      <KpiCell
        label="Disputed"
        value={k.disputedCount}
        borderColor="var(--state-error)"
        numberColor="var(--state-error)"
        bgColor="var(--state-error-bg)"
      />
    </div>
  );
}
