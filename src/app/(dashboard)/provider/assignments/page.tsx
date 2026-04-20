import { Suspense }                  from 'react';
import type { Metadata }             from 'next';
import { getProviderPendingAssignments } from '@/features/assignments/queries';
import { AssignmentList, AssignmentListSkeleton } from '@/features/assignments/components/AssignmentList';

export const metadata: Metadata = { title: 'Assignments — Oweru' };

async function PendingContent() {
  const assignments = await getProviderPendingAssignments();
  return <AssignmentList assignments={assignments} />;
}

export default function ProviderAssignmentsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold text-[var(--text-primary)] leading-tight">
            Pending Assignments
          </h1>
          <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Work offers waiting for your acceptance — accept before the 6-hour window closes
          </p>
        </div>
      </div>

      {/* ── Isolation principle notice ───────────────────────── */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-[var(--radius-md)] text-[13px] leading-relaxed"
        style={{ background: 'var(--surface-overlay)', color: 'var(--text-secondary)' }}
      >
        <span className="shrink-0 text-[16px]">🔒</span>
        <p>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            Privacy protected —{' '}
          </span>
          Owner contact details and exact addresses are only shared after you accept.
          You will see the neighbourhood area and service type before committing.
        </p>
      </div>

      {/* ── Assignment grid ──────────────────────────────────── */}
      <Suspense fallback={<AssignmentListSkeleton />}>
        <PendingContent />
      </Suspense>

    </div>
  );
}