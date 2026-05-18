'use client';

import { CheckCircle2, X } from 'lucide-react';
import { formatTZS } from '@/shared/lib/currency';

interface Props {
  open: boolean;
  withdrawalId: string;
  amount: number;
  onClose: () => void;
}

export function PayoutSuccessModal({ open, withdrawalId, amount, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}>
      <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl w-full max-w-sm flex flex-col shadow-[0_4px_12px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="flex justify-end p-3">
          <button onClick={onClose} aria-label="Close" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>
        <div className="px-8 pb-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--state-success-bg)] text-[var(--state-success)] flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-h2 font-semibold text-[var(--text-primary)]">Payout Requested</h2>
          <p className="text-body-md text-[var(--text-secondary)]">
            {formatTZS(amount)} will arrive on your mobile money within 24 hours.
          </p>
          <p className="text-body-sm text-[var(--text-muted)] tabular-nums">Ref: {withdrawalId.slice(0, 12).toUpperCase()}</p>
          <button onClick={onClose} className="mt-2 w-full py-2.5 bg-[var(--brand-gold)] text-[var(--brand-primary)] text-label rounded hover:opacity-90">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
