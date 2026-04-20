import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  const displayName = session.user.name ?? session.user.email ?? undefined;

  return (
    <DashboardShell role="OWNER" userName={displayName}>
      {children}
    </DashboardShell>
  );
}