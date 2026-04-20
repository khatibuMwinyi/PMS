import { ClipboardList } from 'lucide-react';
import { AssignmentCard }  from './AssignmentCard';
import type { AssignmentWithDetails } from '../types';

interface AssignmentListProps {
  assignments: AssignmentWithDetails[];
}

function EmptyAssignments() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center min-h-[420px] rounded-[var(--radius-xl)] border border-dashed"
      style={{ borderColor: 'var(--border-default)' }}
    >
      <div
        className="mb-5 w-16 h-16 rounded-[var(--radius-xl)] flex items-center justify-center"
        style={{ background: 'var(--surface-overlay)' }}
      >
        <ClipboardList size={24} style={{ color: 'var(--text-muted)' }} />
      </div>
      <h2 className="font-display text-[20px] text-[var(--text-primary)] mb-2">
        No pending assignments
      </h2>
      <p className="text-[14px] max-w-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        New work offers will appear here when Oweru matches you to a job.
        Make sure your service categories and operational zones are up to date.
      </p>
    </div>
  );
}

export function AssignmentList({ assignments }: AssignmentListProps) {
  if (assignments.length === 0) {
    return <EmptyAssignments />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {assignments.map((a) => (
        <AssignmentCard key={a.id} assignment={a} />
      ))}
    </div>
  );
}

export function AssignmentListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-[var(--radius-lg)] border overflow-hidden"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-card)' }}
        >
          {/* Header skeleton */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-page)' }}
          >
            <div className="h-4 w-32 rounded animate-pulse-skeleton" style={{ background: 'var(--surface-overlay)' }} />
            <div className="h-5 w-16 rounded-pill animate-pulse-skeleton" style={{ background: 'var(--surface-overlay)' }} />
          </div>
          {/* Body skeleton */}
          <div className="px-5 py-4 flex flex-col gap-3">
            <div className="h-3 w-20 rounded animate-pulse-skeleton" style={{ background: 'var(--surface-overlay)' }} />
            <div className="h-4 w-40 rounded animate-pulse-skeleton" style={{ background: 'var(--surface-overlay)' }} />
            <div className="h-3 w-full rounded animate-pulse-skeleton" style={{ background: 'var(--surface-overlay)' }} />
          </div>
          {/* Button skeleton */}
          <div className="px-5 pb-5">
            <div className="h-10 rounded-[var(--radius-md)] animate-pulse-skeleton" style={{ background: 'var(--surface-overlay)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}