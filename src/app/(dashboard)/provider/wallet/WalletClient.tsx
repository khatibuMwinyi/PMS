'use client';

import { useState } from 'react';
import { Wallet as WalletIcon, Clock, TrendingUp } from 'lucide-react';
import { RequestPayoutModal } from '@/features/wallets/components/RequestPayoutModal';
import { PayoutSuccessModal } from '@/features/wallets/components/PayoutSuccessModal';
import { TransactionHistoryTable } from '@/features/wallets/components/TransactionHistoryTable';
import { formatTZS } from '@/shared/lib/currency';
import type { WalletSummary } from '@/features/wallets/types';

interface Props {
  initialWallet: WalletSummary | null;
}

export function WalletClient({ initialWallet }: Props) {
  const [wallet, setWallet] = useState(initialWallet);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [success, setSuccess] = useState<{ id: string; amount: number } | null>(null);

  if (!wallet) {
    return (
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-body-sm text-[var(--text-muted)]">
        No wallet yet. Complete and verify your first task to begin earning.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-label text-[var(--text-muted)]">Available Balance</span>
            <WalletIcon size={18} className="text-[var(--text-muted)]" />
          </div>
          <span className="text-h1 font-semibold text-[var(--text-primary)] tabular-nums">{formatTZS(wallet.availableBalance)}</span>
          <button
            onClick={() => setPayoutOpen(true)}
            disabled={wallet.availableBalance < 50_000}
            className="mt-6 w-full py-2.5 bg-[var(--brand-gold)] text-[var(--brand-primary)] text-label rounded hover:opacity-90 disabled:opacity-50"
          >
            Request Payout
          </button>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-label text-[var(--text-muted)]">Pending Clearing</span>
            <Clock size={18} className="text-[var(--text-muted)]" />
          </div>
          <span className="text-h1 font-semibold text-[var(--text-primary)] tabular-nums">{formatTZS(wallet.pendingBalance)}</span>
          <p className="text-body-sm text-[var(--text-muted)] mt-2">Clears 24h after task verification</p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-label text-[var(--text-muted)]">Total Earned</span>
            <TrendingUp size={18} className="text-[var(--text-muted)]" />
          </div>
          <span className="text-h1 font-semibold text-[var(--text-primary)] tabular-nums">{formatTZS(wallet.totalEarned)}</span>
          <p className="text-body-sm text-[var(--text-muted)] mt-2">80% share of all completed services</p>
        </div>
      </div>
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] overflow-hidden mt-6">
        <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center">
          <h3 className="text-h2 font-semibold text-[var(--text-primary)]">Transaction History</h3>
        </div>
        <TransactionHistoryTable transactions={wallet.transactions} />
      </div>
      <RequestPayoutModal
        open={payoutOpen}
        walletId={wallet.id}
        availableBalance={wallet.availableBalance}
        onClose={() => setPayoutOpen(false)}
        onSuccess={(id, amount) => {
          setPayoutOpen(false);
          setSuccess({ id, amount });
          setWallet({ ...wallet, availableBalance: wallet.availableBalance - amount });
        }}
      />
      {success && (
        <PayoutSuccessModal open withdrawalId={success.id} amount={success.amount} onClose={() => setSuccess(null)} />
      )}
    </>
  );
}
