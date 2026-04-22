import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { Suspense } from 'react';
import ProviderWalletSkeleton from '@/components/dashboard/ProviderWalletSkeleton';
import { getProviderWallet } from '@/features/wallets/queries';

export const dynamic = 'force-dynamic';

export default function ProviderWalletPage() {
  return (
    <RoleGuard allowedRoles={['PROVIDER']}>
      <Suspense fallback={<ProviderWalletSkeleton />}>
        <ProviderWalletContent />
      </Suspense>
    </RoleGuard>
  );
}

async function ProviderWalletContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'PROVIDER') redirect('/login');

  const wallet = await getProviderWallet();

  if (!wallet) {
    return (
      <div className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)]">
        No wallet data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-[20px] font-semibold text-[var(--text-primary)]">Wallet</h1>
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>Your earnings and balances</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)]">
          <p className="text-sm text-[var(--text-muted)]">Available Balance</p>
          <p className="text-2xl font-bold">${wallet.availableBalance.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)]">
          <p className="text-sm text-[var(--text-muted)]">Pending Balance</p>
          <p className="text-2xl font-bold">${wallet.pendingBalance.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}