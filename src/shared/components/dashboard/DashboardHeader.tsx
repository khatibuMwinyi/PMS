// src/shared/components/dashboard/DashboardHeader.tsx
interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  asOf?: Date;
}

function formatAsOf(d: Date): string {
  return d.toLocaleString('en-GB', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export function DashboardHeader({ title, subtitle, asOf }: DashboardHeaderProps) {
  return (
    <div className="mb-8 flex justify-between items-end">
      <div>
        <h1 className="text-h1 font-semibold text-[var(--text-primary)]">{title}</h1>
        {subtitle && (
          <p className="text-body-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>
        )}
      </div>
      {asOf && (
        <div className="text-right">
          <span className="text-body-sm text-[var(--text-muted)]">Data as of</span>
          <p className="text-label font-semibold text-[var(--text-primary)]">{formatAsOf(asOf)}</p>
        </div>
      )}
    </div>
  );
}
