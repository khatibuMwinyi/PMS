import { auth } from '@/core/auth';
import { redirect } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { getProviderWallet } from '@/features/wallets/queries';
import { WalletClient } from './WalletClient';

export const dynamic = 'force-dynamic';

export default async function ProviderWalletPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'PROVIDER') redirect('/login');
  const wallet = await getProviderWallet();
  return (
    <RoleGuard allowedRoles={['PROVIDER']}>
      <DashboardHeader title="Wallet & Earnings" subtitle="Manage your funds and view transaction history." asOf={new Date()} />
      <WalletClient initialWallet={wallet} />
    </RoleGuard>
  );
}
