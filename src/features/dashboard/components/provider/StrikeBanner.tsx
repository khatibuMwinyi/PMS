import { AlertTriangle, AlertOctagon, Ban } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ProviderDashboardData } from '../../schemas/provider-dashboard.schema';

type Tier = 'suspended' | 'critical' | 'warning' | 'none';

function pickTier(strikeCount: number, suspendedUntil: string | null): Tier {
  if (suspendedUntil && new Date(suspendedUntil) > new Date()) return 'suspended';
  if (strikeCount >= 2) return 'critical';
  if (strikeCount >= 1) return 'warning';
  return 'none';
}

function formatSuspensionDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(iso));
}

interface Props {
  metrics: ProviderDashboardData['metrics'];
}

export function StrikeBanner({ metrics }: Props) {
  const tier = pickTier(metrics.strikeCount, metrics.suspendedUntil);
  if (tier === 'none') return null;

  let icon: LucideIcon;
  let title: string;
  let body: React.ReactNode;
  let container: string;

  if (tier === 'suspended') {
    icon = Ban;
    title = 'Account suspended';
    body = (
      <>
        You cannot accept new work orders until{' '}
        <strong>{formatSuspensionDate(metrics.suspendedUntil!)}</strong>.
      </>
    );
    container = 'bg-[var(--state-error-bg)] text-[var(--state-error)] border-[var(--state-error)]/30';
  } else if (tier === 'critical') {
    icon = AlertOctagon;
    title = `You have ${metrics.strikeCount} strikes`;
    body =
      'One more strike will suspend your account for 30 days. Keep your scheduled tasks on time and check in within the GPS radius.';
    container = 'bg-[var(--state-error-bg)] text-[var(--state-error)] border-[var(--state-error)]/30';
  } else {
    icon = AlertTriangle;
    title = `You have ${metrics.strikeCount} strike${metrics.strikeCount === 1 ? '' : 's'}`;
    body =
      '2 more strikes will result in a 30-day suspension. Avoid no-shows and late completions to keep your account active.';
    container = 'bg-[var(--state-warning-bg)] text-[var(--state-warning)] border-[var(--state-warning)]/30';
  }

  const Icon = icon;

  return (
    <div className={`rounded-lg border ${container} p-4 flex items-start gap-3`} role="alert">
      <Icon size={20} className="shrink-0 mt-0.5" aria-hidden />
      <div>
        <h3 className="text-h2 font-semibold">{title}</h3>
        <p className="text-body-sm mt-1">{body}</p>
      </div>
    </div>
  );
}
