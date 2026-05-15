import { type LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/cn';

type Tone = 'default' | 'success' | 'warning' | 'danger' | 'info';
type Size = 'sm' | 'md' | 'lg';

interface StatProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: { direction: 'up' | 'down'; value: number };
  icon?: LucideIcon;
  tone?: Tone;
  size?: Size;
  className?: string;
}

const TONE_TEXT: Record<Tone, string> = {
  default: 'text-text-primary',
  success: 'text-state-success',
  warning: 'text-state-warning',
  danger:  'text-state-error',
  info:    'text-state-info',
};

const VALUE_SIZE: Record<Size, string> = {
  sm: 'text-h3',
  md: 'text-h2',
  lg: 'text-display',
};

export function Stat({
  label,
  value,
  unit,
  trend,
  icon: Icon,
  tone = 'default',
  size = 'md',
  className,
}: StatProps) {
  return (
    <div className={cn('relative', className)}>
      {Icon && (
        <Icon size={20} className="absolute right-0 top-0 text-text-muted" aria-hidden />
      )}
      <p className="text-caption uppercase text-text-muted">{label}</p>
      <p className={cn('font-medium tabular-nums mt-1', VALUE_SIZE[size], TONE_TEXT[tone])}>
        {value}
        {unit && <span className="ml-1.5 text-body-sm text-text-muted font-normal">{unit}</span>}
      </p>
      {trend && (
        <span
          className={cn(
            'mt-2 inline-flex items-center gap-1 text-body-sm',
            trend.direction === 'up' ? 'text-state-success' : 'text-state-error',
          )}
        >
          {trend.direction === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend.value}%
        </span>
      )}
    </div>
  );
}
