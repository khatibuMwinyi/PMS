import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { AssignmentStatus } from '../types';

type StepState = 'completed' | 'active' | 'pending';
type StepKey = 'ASSIGNED' | 'ON_SITE' | 'IN_PROGRESS' | 'REVIEW';

const STEP_ORDER: StepKey[] = ['ASSIGNED', 'ON_SITE', 'IN_PROGRESS', 'REVIEW'];
const STEP_LABEL: Record<StepKey, string> = {
  ASSIGNED:    'Assigned',
  ON_SITE:     'On Site',
  IN_PROGRESS: 'In Progress',
  REVIEW:      'Review',
};

function activeIndex(status: AssignmentStatus): number {
  switch (status) {
    case 'PENDING_ACCEPTANCE': return -1;
    case 'ACCEPTED':           return 1;
    case 'IN_PROGRESS':        return 2;
    case 'COMPLETED':          return 3;
    case 'DISPUTED':           return 3;
    case 'VERIFIED':           return 4; // all done
    default:                   return -1;
  }
}

export function AssignmentStepTracker({ status }: { status: AssignmentStatus }) {
  const cur = activeIndex(status);

  return (
    <div className="w-full bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-4 overflow-x-auto">
      <div className="min-w-[480px] flex items-center justify-between relative">
        <div className="absolute top-4 left-[5%] right-[5%] h-px bg-[var(--border-subtle)] -z-10" />
        {STEP_ORDER.map((key, idx) => {
          const state: StepState =
            idx < cur ? 'completed' : idx === cur ? 'active' : 'pending';
          return (
            <div key={key} data-state={state} className="flex flex-col items-center gap-1 w-1/4">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center z-10 text-label',
                  state === 'completed' && 'bg-[var(--surface-overlay)] border-2 border-[var(--brand-primary)] text-[var(--brand-primary)]',
                  state === 'active'    && 'bg-[var(--brand-primary)] text-[var(--text-on-brand)] shadow-[0_0_0_4px_var(--surface-card)]',
                  state === 'pending'   && 'bg-[var(--surface-card)] border-2 border-[var(--border-subtle)] text-[var(--text-muted)]',
                )}
              >
                {state === 'completed' ? <Check size={16} /> : idx + 1}
              </div>
              <span
                className={cn(
                  'text-label',
                  state === 'pending' ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]',
                  state === 'active'  && 'font-bold',
                )}
              >
                {STEP_LABEL[key]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
