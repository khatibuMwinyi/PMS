import { auth } from '@/core/auth';
import { redirect } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import { Suspense } from 'react';
import ProviderEarningsSkeleton from '@/components/dashboard/ProviderEarningsSkeleton';
import { getProviderEarnings } from '@/lib/api/provider';

export const dynamic = 'force-dynamic';

export default function ProviderEarningsPage() {
  return (
    <RoleGuard allowedRoles={['PROVIDER']}>
      <Suspense fallback={<ProviderEarningsSkeleton />}>
        <ProviderEarningsContent />
      </Suspense>
    </RoleGuard>
  );
}

async function ProviderEarningsContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'PROVIDER') redirect('/login');

  const earnings = await getProviderEarnings(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-[20px] font-semibold text-[var(--text-primary)]">Earnings</h1>
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>Your earnings overview</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)]">
          <p className="text-sm text-[var(--text-muted)]">Available Balance</p>
          <p className="text-2xl font-bold">${earnings.availableBalance.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)]">
          <p className="text-sm text-[var(--text-muted)]">Pending Balance</p>
          <p className="text-2xl font-bold">${earnings.pendingBalance.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}