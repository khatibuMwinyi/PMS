import type { OwnerServiceStatus } from '../schemas';

const STATUS_CONFIG: Record<OwnerServiceStatus, { label: string; bg: string; fg: string }> = {
  PENDING_ASSIGNMENT: {
    label: 'Pending',
    bg: 'bg-[var(--state-info-bg)]',
    fg: 'text-[var(--state-info)]',
  },
  PENDING_ACCEPTANCE: {
    label: 'Awaiting Accept',
    bg: 'bg-[var(--state-info-bg)]',
    fg: 'text-[var(--state-info)]',
  },
  SCHEDULED: {
    label: 'Scheduled',
    bg: 'bg-[#EDE9FE]',
    fg: 'text-[var(--status-scheduled)]',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-[var(--state-warning-bg)]',
    fg: 'text-[var(--state-warning)]',
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-[var(--state-success-bg)]',
    fg: 'text-[var(--state-success)]',
  },
  DISPUTED: {
    label: 'Disputed',
    bg: 'bg-[var(--state-error-bg)]',
    fg: 'text-[var(--state-error)]',
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-[var(--surface-container-high)]',
    fg: 'text-[var(--text-muted)]',
  },
};

export function StatusBadge({ status }: { status: OwnerServiceStatus }) {
  const s = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${s.bg} ${s.fg}`}
    >
      {s.label}
    </span>
  );
}
