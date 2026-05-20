// src/shared/components/ui/KpiCard.tsx
import { type LucideIcon, ArrowUp, ArrowDown, Minus, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    direction: 'up' | 'down' | 'flat';
    pctFormatted: string;
    comparisonLabel: string;
  } | null;
  subtext?: { icon?: LucideIcon; text: string };
}

export function KpiCard({ label, value, icon: Icon, trend, subtext }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-caption uppercase text-[var(--text-muted)]">{label}</span>
        <Icon size={18} className="text-[var(--text-muted)]" aria-hidden />
      </div>
      <div className="mt-auto">
        <span className="text-h2 tabular-nums text-[var(--text-primary)]">{value}</span>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 mt-1 text-body-sm',
              trend.direction === 'up' && 'text-state-success',
              trend.direction === 'down' && 'text-state-error',
              trend.direction === 'flat' && 'text-[var(--text-muted)]',
            )}
          >
            {trend.direction === 'up' && <ArrowUp size={14} />}
            {trend.direction === 'down' && <ArrowDown size={14} />}
            {trend.direction === 'flat' && <Minus size={14} />}
            <span>{trend.pctFormatted} {trend.comparisonLabel}</span>
          </div>
        )}
        {subtext && (
          <div className="flex items-center gap-1 mt-1 text-body-sm text-[var(--text-secondary)]">
            {subtext.icon && <subtext.icon size={14} />}
            <span>{subtext.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
