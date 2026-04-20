import { cn } from '@/core/lib/utils';

type Role = 'ADMIN' | 'STAFF' | 'OWNER' | 'PROVIDER';

const ROLE_STYLES: Record<Role, string> = {
  ADMIN:    'bg-[var(--state-info-bg)]    text-[var(--state-info)]',
  STAFF:    'bg-[var(--state-warning-bg)] text-[var(--state-warning)]',
  OWNER:    'bg-[#e8f7f2]                 text-[var(--brand-primary-dim)]',
  PROVIDER: 'bg-[var(--state-success-bg)] text-[var(--state-success)]',
};

const ROLE_LABELS: Record<Role, string> = {
  ADMIN:    'Admin',
  STAFF:    'Staff',
  OWNER:    'Owner',
  PROVIDER: 'Provider',
};

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const styles = ROLE_STYLES[role as Role] ?? 'bg-[var(--surface-overlay)] text-[var(--text-secondary)]';
  const label  = ROLE_LABELS[role as Role] ?? role;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-pill',
        'text-[11px] font-medium font-sans tracking-wide',
        styles,
        className,
      )}
    >
      {label}
    </span>
  );
}