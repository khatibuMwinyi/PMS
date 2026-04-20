import { cn } from '@/core/lib/utils';

type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'PENDING_VERIFICATION' | string;

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:               'bg-[var(--state-success-bg)] text-[var(--state-success)]',
  INACTIVE:             'bg-[var(--surface-overlay)]   text-[var(--text-secondary)]',
  PENDING:              'bg-[var(--state-warning-bg)]  text-[var(--state-warning)]',
  PENDING_VERIFICATION: 'bg-[var(--state-warning-bg)]  text-[var(--state-warning)]',
  SUSPENDED:            'bg-[var(--state-error-bg)]    text-[var(--state-error)]',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE:               'Active',
  INACTIVE:             'Inactive',
  PENDING:              'Pending',
  PENDING_VERIFICATION: 'Pending Verification',
  SUSPENDED:            'Suspended',
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status] ?? 'bg-[var(--surface-overlay)] text-[var(--text-secondary)]';
  const label  = STATUS_LABELS[status] ?? status;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-pill',
        'text-[11px] font-medium font-sans',
        styles,
        className,
      )}
    >
      {label}
    </span>
  );
}