import { type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'success' | 'warning' | 'info' | 'error' | 'neutral' | 'gold' | 'dark' | 'outline';
type Size = 'sm' | 'md';

interface BadgeProps {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const VARIANT: Record<Variant, { bg: string; text: string; dot: string }> = {
  success: { bg: 'bg-state-success-bg', text: 'text-state-success',   dot: 'bg-state-success' },
  warning: { bg: 'bg-state-warning-bg', text: 'text-state-warning',   dot: 'bg-state-warning' },
  info:    { bg: 'bg-state-info-bg',    text: 'text-state-info',      dot: 'bg-state-info' },
  error:   { bg: 'bg-state-error-bg',   text: 'text-state-error',     dot: 'bg-state-error' },
  neutral: { bg: 'bg-surface-overlay',  text: 'text-text-secondary',  dot: 'bg-text-muted' },
  gold:    { bg: 'bg-accent/15',        text: 'text-accent-dark',     dot: 'bg-accent' },
  dark:    { bg: 'bg-primary',          text: 'text-white',   dot: 'bg-accent' },
  outline: { bg: 'bg-transparent border border-border-default', text: 'text-text-secondary', dot: 'bg-text-muted' },
};

const SIZE: Record<Size, string> = {
  sm: 'h-5 px-2 text-caption gap-1',
  md: 'h-6 px-2.5 text-caption gap-1.5',
};

export function Badge({ variant = 'neutral', size = 'md', icon: Icon, dot, children, className }: BadgeProps) {
  const v = VARIANT[variant];
  return (
    <span className={cn('inline-flex items-center rounded-pill font-medium', v.bg, v.text, SIZE[size], className)}>
      {dot && <span data-testid="badge-dot" className={cn('w-1.5 h-1.5 rounded-pill', v.dot)} />}
      {Icon && <Icon size={size === 'sm' ? 10 : 12} aria-hidden />}
      {children}
    </span>
  );
}

// Compatibility shim — keeps existing StatusBadge call sites working unchanged
const STATUS_MAP: Record<string, Variant> = {
  ACTIVE: 'success', ACCEPTED: 'success', COMPLETED: 'success', VERIFIED: 'success',
  PENDING: 'warning', PENDING_VERIFICATION: 'warning', PENDING_ASSIGNMENT: 'warning',
  IN_PROGRESS: 'info', SCHEDULED: 'info',
  // Space-separated variants from legacy ui/StatusBadge
  'IN PROGRESS': 'info',
  SUSPENDED: 'error', CANCELLED: 'error', REJECTED: 'error', URGENT: 'error',
  EXPIRED: 'neutral', DRAFT: 'neutral', QUOTED: 'warning', INACTIVE: 'neutral',
};

export function StatusBadge({
  status,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  variant: _variant,
  ...rest
}: { status: string; variant?: string } & Omit<BadgeProps, 'variant' | 'children'>) {
  const variant = STATUS_MAP[status] ?? 'neutral';
  const label = status.replace(/_/g, ' ').toLowerCase();
  return <Badge variant={variant} dot {...rest}>{label}</Badge>;
}
