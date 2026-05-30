'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, MessageSquareWarning, X } from 'lucide-react';
import {
  cancelOwnerAgreement,
  verifyOwnerAssignment,
  fileOwnerDispute,
} from '@/features/owner-services/actions';

interface Props {
  agreementId: string;
  quotedPrice: string;
  canCancel: boolean;
  canVerify: boolean;
  canDispute: boolean;
  cancelPenaltyApplies: boolean;
  verificationDeadlineIso: string | null;
}

type ModalKind = 'cancel' | 'verify' | 'dispute' | null;

const DISPUTE_REASONS = [
  'No-show',
  'Incomplete work',
  'Damage caused',
  'Quality below expectation',
  'Other',
];

export function OwnerServiceActions(props: Props) {
  const [modal, setModal] = useState<ModalKind>(null);
  const close = () => setModal(null);

  return (
    <div
      className="bg-white border border-[var(--outline-variant)] rounded-[10px] p-5 space-y-3 sticky top-20"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}
    >
      <h2 className="text-[13px] font-bold uppercase tracking-[.05em] text-[#94A3B8] mb-4">
        Actions
      </h2>

      {props.canVerify && (
        <DeadlineBanner deadlineIso={props.verificationDeadlineIso} />
      )}

      <button
        type="button"
        disabled={!props.canVerify}
        onClick={() => setModal('verify')}
        className="w-full px-4 py-2.5 bg-[var(--state-success)] text-white rounded-md text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
      >
        <CheckCircle2 size={16} /> Mark Satisfied
      </button>

      <button
        type="button"
        disabled={!props.canDispute}
        onClick={() => setModal('dispute')}
        className="w-full px-4 py-2.5 bg-white text-[var(--state-error)] border border-[var(--state-error)] rounded-md text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
      >
        <MessageSquareWarning size={16} /> File Dispute
      </button>

      <button
        type="button"
        disabled={!props.canCancel}
        onClick={() => setModal('cancel')}
        className="w-full px-4 py-2.5 bg-white text-[var(--text-primary)] border border-[var(--outline-variant)] rounded-md text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Cancel Service
      </button>

      <p className="text-[11px] text-[var(--text-muted)] leading-snug pt-3 border-t border-[var(--outline-variant)]">
        After provider acceptance, cancellation incurs a 20% penalty
        (15% provider compensation + 5% Oweru). Disputes are reviewed by Oweru staff within 48h.
      </p>

      {modal === 'cancel' && (
        <CancelModal
          agreementId={props.agreementId}
          quotedPrice={props.quotedPrice}
          penaltyApplies={props.cancelPenaltyApplies}
          onClose={close}
        />
      )}
      {modal === 'verify' && (
        <VerifyModal agreementId={props.agreementId} onClose={close} />
      )}
      {modal === 'dispute' && (
        <DisputeModal agreementId={props.agreementId} onClose={close} />
      )}
    </div>
  );
}

function DeadlineBanner({ deadlineIso }: { deadlineIso: string | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (!deadlineIso) return null;
  const remainingMs = new Date(deadlineIso).getTime() - now;
  if (remainingMs <= 0) {
    return (
      <div className="bg-[var(--state-warning-bg)] border border-[var(--outline-variant)] rounded-md p-3 flex gap-2 items-start text-xs text-[var(--state-warning)] font-medium">
        Verification window expired — system will auto-approve.
      </div>
    );
  }
  const hours = Math.floor(remainingMs / 3600_000);
  const mins = Math.floor((remainingMs % 3600_000) / 60_000);
  return (
    <div className="bg-[var(--state-info-bg)] border border-[var(--outline-variant)] rounded-md p-3 flex gap-2 items-center text-xs text-[var(--state-info)] font-medium tabular-nums">
      <span>⏱</span>
      <span>{hours}h {mins}m left to mark satisfied or dispute.</span>
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md max-w-md w-full shadow-modal">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 hover:bg-[var(--surface-container-high)] rounded"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function CancelModal({
  agreementId,
  quotedPrice,
  penaltyApplies,
  onClose,
}: {
  agreementId: string;
  quotedPrice: string;
  penaltyApplies: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const total = Number(quotedPrice);
  const penalty = penaltyApplies ? total * 0.2 : 0;
  const refund = total - penalty;

  const submit = () => {
    setError(null);
    start(async () => {
      try {
        await cancelOwnerAgreement(agreementId);
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Cancellation failed');
      }
    });
  };

  return (
    <ModalShell title="Cancel service" onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
          <AlertTriangle size={18} className="text-[var(--state-warning)] mt-0.5 shrink-0" />
          <p>
            {penaltyApplies
              ? 'Provider has accepted this work order. Cancelling now incurs a 20% penalty.'
              : 'Provider has not accepted yet — cancellation is free.'}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-y-1.5 text-sm bg-[var(--surface-container-low)] rounded p-3">
          <dt className="text-[var(--text-muted)]">Total quoted</dt>
          <dd className="text-right tabular-nums">TZS {total.toLocaleString()}</dd>
          <dt className="text-[var(--text-muted)]">Penalty (20%)</dt>
          <dd className="text-right tabular-nums text-[var(--state-error)]">
            − TZS {penalty.toLocaleString()}
          </dd>
          {penaltyApplies && (
            <>
              <dt className="text-[var(--text-muted)] pl-3 text-xs">→ Provider (15%)</dt>
              <dd className="text-right tabular-nums text-xs text-[var(--text-muted)]">
                TZS {(total * 0.15).toLocaleString()}
              </dd>
              <dt className="text-[var(--text-muted)] pl-3 text-xs">→ Oweru platform (5%)</dt>
              <dd className="text-right tabular-nums text-xs text-[var(--text-muted)]">
                TZS {(total * 0.05).toLocaleString()}
              </dd>
            </>
          )}
          <dt className="font-semibold pt-1 border-t border-outline-variant">Refund</dt>
          <dd className="text-right tabular-nums font-semibold pt-1 border-t border-outline-variant">
            TZS {refund.toLocaleString()}
          </dd>
        </dl>
        {error && <p className="text-sm text-[var(--state-error)]">{error}</p>}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-outline-variant rounded-md text-sm font-medium"
          >
            Keep service
          </button>
          <button
            onClick={submit}
            disabled={pending}
            className="flex-1 px-4 py-2 bg-[var(--state-error)] text-white rounded-md text-sm font-semibold disabled:opacity-60"
          >
            {pending ? 'Cancelling…' : 'Confirm cancellation'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function VerifyModal({
  agreementId,
  onClose,
}: {
  agreementId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    start(async () => {
      try {
        await verifyOwnerAssignment(agreementId);
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Verification failed');
      }
    });
  };

  return (
    <ModalShell title="Mark service satisfied" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-secondary)]">
          Confirm the service was completed to your satisfaction. This releases the provider
          payment and closes the verification window.
        </p>
        {error && <p className="text-sm text-[var(--state-error)]">{error}</p>}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-outline-variant rounded-md text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={pending}
            className="flex-1 px-4 py-2 bg-[var(--state-success)] text-white rounded-md text-sm font-semibold disabled:opacity-60"
          >
            {pending ? 'Saving…' : 'Confirm satisfaction'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function DisputeModal({
  agreementId,
  onClose,
}: {
  agreementId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [reason, setReason] = useState(DISPUTE_REASONS[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (!notes.trim()) {
      setError('Please describe what went wrong.');
      return;
    }
    start(async () => {
      try {
        await fileOwnerDispute(agreementId, reason, notes.trim());
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Dispute filing failed');
      }
    });
  };

  return (
    <ModalShell title="File a dispute" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-secondary)]">
          Oweru staff will review within 48 hours. Provider payment is frozen until resolution.
        </p>
        <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          Reason
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3 py-2 border border-outline-variant rounded-md text-sm bg-[var(--surface-container-lowest)]"
        >
          {DISPUTE_REASONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          Describe what happened
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-outline-variant rounded-md text-sm bg-[var(--surface-container-lowest)]"
          placeholder="Provide details — exclude personal contact info."
        />
        {error && <p className="text-sm text-[var(--state-error)]">{error}</p>}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-outline-variant rounded-md text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={pending}
            className="flex-1 px-4 py-2 bg-[var(--state-error)] text-white rounded-md text-sm font-semibold disabled:opacity-60"
          >
            {pending ? 'Filing…' : 'Submit dispute'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
