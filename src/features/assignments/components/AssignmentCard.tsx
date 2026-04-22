'use client';

import { useState, useTransition } from 'react';
import { useRouter }               from 'next/navigation';
import { MapPin, Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react';
import { acceptAssignment }    from '@/features/assignments/actions';
import { CountdownTimer }      from './CountdownTimer';
import { LoadingButton }       from '@/components/shared/LoadingButton';
import type { AssignmentWithDetails } from '../types';

interface AssignmentCardProps {
  assignment: AssignmentWithDetails;
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<
    | { type: 'idle' }
    | { type: 'conflict' }
    | { type: 'error'; message: string }
    | { type: 'accepted' }
    | { type: 'expired'; startTime: number }
  >({ type: 'idle' });

  const handleAccept = () => {
    startTransition(async () => {
      setState({ type: 'idle' });
      const result = await acceptAssignment(assignment.id);

      if (result.success) {
        setState({ type: 'accepted' });
        // Brief delay so user sees the success state before the list refreshes
        setTimeout(() => router.refresh(), 1200);
        return;
      }

      if (result.conflict) {
        setState({
          type:    'conflict',
        });
        return;
      }

      setState({ type: 'error', message: result.error ?? 'Something went wrong.' });
    });
  };

  // ── Accepted state ───────────────────────────────────────────────
  if (state.type === 'accepted') {
    return (
      <div
        className="rounded-[var(--radius-lg)] border p-6 flex flex-col items-center justify-center gap-3 text-center"
        style={{
          borderColor: 'var(--state-success)',
          background:  'var(--state-success-bg)',
          minHeight:   '180px',
        }}
      >
        <CheckCircle2 size={28} style={{ color: 'var(--state-success)' }} />
        <p className="text-[15px] font-semibold" style={{ color: 'var(--brand-primary-dim)' }}>
          Assignment accepted!
        </p>
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          You'll receive the job details shortly.
        </p>
      </div>
    );
  }

  const isExpired = state.type === 'expired';

  return (
    <div
      className="rounded-[var(--radius-lg)] border flex flex-col gap-0 overflow-hidden transition-shadow duration-200 hover:shadow-[var(--shadow-modal)]"
      style={{
        borderColor: isExpired ? 'var(--border-subtle)' : 'var(--border-default)',
        background:  'var(--surface-card)',
        opacity:     isExpired ? 0.55 : 1,
      }}
    >
      {/* ── Card header: service type + countdown ──────────────── */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-4 border-b"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-page)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Briefcase size={15} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
          <span className="text-[14px] font-semibold text-[var(--text-primary)] truncate">
            {assignment.serviceType.name}
          </span>
        </div>

        <CountdownTimer
          expiresAt={assignment.expiresAt}
          onExpired={() => {
            setState({ type: 'expired', startTime: Date.now() });
            setTimeout(() => router.refresh(), 4000);
          }}
        />
      </div>

      {/* ── Card body: zone info (PII-safe) ────────────────────── */}
      <div className="px-5 py-4 flex flex-col gap-3">

        {/* Zone — neighbourhood only, never exact address */}
        <div className="flex items-start gap-2">
          <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-muted)' }}>
              Service Area
            </p>
            <p className="text-[14px] font-medium text-[var(--text-primary)]">
              {assignment.property.zone}
            </p>
          </div>
        </div>

        {/* Privacy notice */}
        <p className="text-[12px] leading-snug" style={{ color: 'var(--text-muted)' }}>
          Exact address is shared only after you accept this assignment.
        </p>

        {/* ── Status messages ──────────────────────────────────── */}
        {state.type === 'conflict' && (
          <div
            className="flex items-start gap-2 px-3 py-2.5 rounded-[var(--radius-md)]"
            style={{ background: 'var(--state-warning-bg)' }}
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--state-warning)' }} />
            <p className="text-[13px]" style={{ color: 'var(--state-warning)' }}>
              This assignment was just taken by another provider.
            </p>
          </div>
        )}

        {state.type === 'error' && (
          <div
            className="flex items-start gap-2 px-3 py-2.5 rounded-[var(--radius-md)]"
            style={{ background: 'var(--state-error-bg)' }}
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--state-error)' }} />
            <p className="text-[13px]" style={{ color: 'var(--state-error)' }}>
              {state.message}
            </p>
          </div>
        )}

        {state.type === 'expired' && (
          <div
            className="flex items-start gap-2 px-3 py-2.5 rounded-[var(--radius-md)]"
            style={{ background: 'var(--state-warning-bg)' }}
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--state-warning)' }} />
            <p className="text-[13px]" style={{ color: 'var(--state-warning)' }}>
              This assignment has expired and been reassigned to another provider.
            </p>
          </div>
        )}
      </div>

      {/* ── Accept button ───────────────────────────────────────── */}
      <div className="px-5 pb-5">
        {isExpired ? (
          <div
            className="flex items-center justify-center h-10 rounded-[var(--radius-md)] text-[13px] font-medium"
            style={{ background: 'var(--surface-overlay)', color: 'var(--text-muted)' }}
          >
            Offer expired
          </div>
        ) : (
          <LoadingButton
            onClick={handleAccept}
            variant="primary"
            size="md"
            fullWidth
            loading={isPending}
            loadingText="Accepting…"
            disabled={state.type === 'conflict'}
          >
            Accept Assignment
          </LoadingButton>
        )}
      </div>
    </div>
  );
}