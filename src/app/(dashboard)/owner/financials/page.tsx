import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import RoleGuard from '@/components/RoleGuard';

export const dynamic = 'force-dynamic';

export default async function OwnerFinancialsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') redirect('/login');
  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <DashboardShell role="OWNER" userName={session.user.name} pageTitle="Financials">
        <div className="max-w-2xl mx-auto py-24 text-center">
          <h1 className="text-h1 font-semibold text-[var(--text-primary)] mb-3">Financials</h1>
          <p className="text-body-sm text-[var(--text-secondary)]">
            Coming soon. This page is under construction.
          </p>
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
