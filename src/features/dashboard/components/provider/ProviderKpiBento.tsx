import { Wallet, ClipboardCheck, CheckCircle2, Star, ArrowUp, ArrowDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { formatTZS } from '@/shared/lib/currency';
import type { ProviderDashboardData } from '../../schemas/provider-dashboard.schema';

export function ProviderKpiBento({
  earnings,
  metrics,
}: {
  earnings: ProviderDashboardData['earnings'];
  metrics: ProviderDashboardData['metrics'];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="Today's Earnings"
        icon={Wallet}
        value={formatTZS(earnings.todayTZS)}
        hint={
          <span className="inline-flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-[var(--surface-overlay)] text-[var(--text-secondary)] text-label">
              80% Share
            </span>
            <span className="text-body-sm text-[var(--text-muted)]">of total billed</span>
          </span>
        }
      />
      <Card
        label="Active Tasks"
        icon={ClipboardCheck}
        value={String(metrics.activeTaskCount)}
        hint={<span className="text-body-sm text-[var(--text-muted)]">Requires attention today</span>}
      />
      <Card
        label="Acceptance Rate"
        icon={CheckCircle2}
        value={`${metrics.acceptanceRate.toFixed(0)}%`}
        hint={
          <span
            className={`inline-flex items-center gap-1 text-body-sm ${
              metrics.acceptanceRateDeltaPct >= 0 ? 'text-[var(--state-success)]' : 'text-[var(--state-error)]'
            }`}
          >
            {metrics.acceptanceRateDeltaPct >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(metrics.acceptanceRateDeltaPct).toFixed(1)}% vs last week
          </span>
        }
      />
      <Card
        label="Average Rating"
        icon={Star}
        value={`${metrics.rating.toFixed(1)} / 5.0`}
        hint={
          <span className="text-body-sm text-[var(--text-muted)]">
            Based on {metrics.ratingCount} reviews
          </span>
        }
      />
    </div>
  );
}

function Card({
  label,
  icon: Icon,
  value,
  hint,
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  hint: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-label uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
        <Icon size={18} className="text-[var(--text-muted)]" />
      </div>
      <span className="text-[28px] leading-[36px] font-semibold text-[var(--text-primary)] tabular-nums">
        {value}
      </span>
      <div className="mt-1">{hint}</div>
    </div>
  );
}
