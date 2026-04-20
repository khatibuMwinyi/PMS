import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect('/login');
  if (session.user.role !== 'PROVIDER') redirect('/login');

  const displayName = session.user.name ?? session.user.email ?? undefined;

  return (
    <DashboardShell role="PROVIDER" userName={displayName}>
      {children}
    </DashboardShell>
  );
}