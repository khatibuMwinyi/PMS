'use client';

import { useState, useTransition } from 'react';
import { X, Wallet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { requestWithdrawal } from '../actions';
import { MIN_WITHDRAWAL_TZS, WithdrawalRequestSchema } from '../schemas';
import { formatTZS } from '@/shared/lib/currency';

interface Props {
  open: boolean;
  walletId: string;
  availableBalance: number;
  onClose: () => void;
  onSuccess: (withdrawalId: string, amount: number) => void;
}

export function RequestPayoutModal({ open, walletId, availableBalance, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const submit = () => {
    setError(null);
    const parsed = WithdrawalRequestSchema.safeParse({
      walletId,
      amount: Number(amount),
      mobileNumber: mobile,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    if (parsed.data.amount > availableBalance) {
      setError('Amount exceeds available balance.');
      return;
    }
    startTransition(async () => {
      try {
        const { withdrawalId } = await requestWithdrawal(walletId, parsed.data.amount, mobile);
        onSuccess(withdrawalId, parsed.data.amount);
      } catch (e: any) {
        toast.error(e.message ?? 'Withdrawal failed');
      }
    });
  };

  const withdrawAll = () => setAmount(String(availableBalance));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}
    >
      <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl w-full max-w-md flex flex-col shadow-[0_4px_12px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <h2 className="text-h2 font-semibold text-[var(--text-primary)]">Request Payout</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-6">
          <div className="bg-[var(--surface-page)] rounded-lg p-4 border border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <span className="block text-label text-[var(--text-muted)] mb-1">Available Balance</span>
              <span className="block text-h1 font-semibold text-[var(--text-primary)] tabular-nums">
                {formatTZS(availableBalance)}
              </span>
            </div>
            <div className="h-12 w-12 rounded-full bg-[var(--surface-overlay)] flex items-center justify-center text-[var(--brand-primary)]">
              <Wallet size={20} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="amount" className="text-label text-[var(--text-primary)]">
                Withdrawal Amount (TZS)
              </label>
              <input
                id="amount"
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
                className="w-full px-3 py-2 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded text-body-md text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--brand-gold)] focus:border-[var(--brand-gold)]"
              />
              <div className="flex justify-between text-body-sm">
                <span className="text-[var(--text-muted)]">Minimum: {formatTZS(MIN_WITHDRAWAL_TZS)}</span>
                <button
                  type="button"
                  onClick={withdrawAll}
                  className="text-[var(--brand-gold)] hover:underline"
                >
                  Withdraw All
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="mobile" className="text-label text-[var(--text-primary)]">
                Mobile Money Number
              </label>
              <input
                id="mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+255712345678"
                className="w-full px-3 py-2 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded text-body-md text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--brand-gold)] focus:border-[var(--brand-gold)]"
              />
            </div>
          </div>
          {error && (
            <p className="text-body-sm text-[var(--state-error)]" role="alert">
              {error}
            </p>
          )}
          <dl className="text-body-sm space-y-1 pt-4 border-t border-[var(--border-subtle)]">
            <div className="flex justify-between">
              <dt className="text-[var(--text-muted)]">Estimated arrival</dt>
              <dd className="text-[var(--text-primary)] font-medium">Within 24 hours</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-muted)]">Fee</dt>
              <dd className="text-[var(--text-primary)] font-medium">{formatTZS(0)}</dd>
            </div>
          </dl>
        </div>
        <div className="p-6 bg-[var(--surface-page)] border-t border-[var(--border-subtle)] flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-label border border-[var(--border-subtle)] rounded text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={isPending}
            className="px-4 py-2 text-label bg-[var(--brand-gold)] text-[var(--brand-primary)] rounded hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Confirm Payout
          </button>
        </div>
      </div>
    </div>
  );
}
