import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { HistoryStatus } from '../queries';

interface Props {
  active: HistoryStatus[];
}

const PILLS: Array<{ value: HistoryStatus; label: string }> = [
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'VERIFIED',  label: 'Verified'  },
  { value: 'DISPUTED',  label: 'Disputed'  },
  { value: 'OVERDUE',   label: 'Overdue'   },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function toggleHref(active: HistoryStatus[], value: HistoryStatus): string {
  const isActive = active.includes(value);
  const next = isActive ? active.filter((v) => v !== value) : [...active, value];
  if (next.length === 0) return '/provider/history';
  const params = new URLSearchParams({ status: next.join(',') });
  return `/provider/history?${params.toString()}`;
}

export function HistoryFilters({ active }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {PILLS.map((p) => {
        const isActive = active.includes(p.value);
        return (
          <Link
            key={p.value}
            href={toggleHref(active, p.value)}
            data-active={isActive ? 'true' : 'false'}
            className={cn(
              'inline-flex items-center px-3 py-1.5 rounded-full text-label border transition-colors',
              isActive
                ? 'bg-[var(--brand-primary)] text-[var(--text-on-brand)] border-[var(--brand-primary)]'
                : 'bg-[var(--surface-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-default)]',
            )}
          >
            {p.label}
          </Link>
        );
      })}
    </div>
  );
}
