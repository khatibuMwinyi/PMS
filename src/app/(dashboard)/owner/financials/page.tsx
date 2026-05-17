import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { OwnerFinancialsSummary } from '@/features/financials/components/OwnerFinancialsSummary';
import { OwnerInvoicesTable } from '@/features/financials/components/OwnerInvoicesTable';
import {
  FinancialsSummarySkeleton,
  InvoicesTableSkeleton,
} from '@/features/financials/components/skeletons';

export const dynamic = 'force-dynamic';

export default async function OwnerFinancialsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  const ownerUserId = session.user.id;

  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <DashboardHeader
        title="Financials"
        subtitle="Invoices, payments to Oweru, and utility expenses across your portfolio."
      />

      <Suspense fallback={<FinancialsSummarySkeleton />}>
        <OwnerFinancialsSummary ownerUserId={ownerUserId} />
      </Suspense>

      <Suspense fallback={<InvoicesTableSkeleton />}>
        <OwnerInvoicesTable ownerUserId={ownerUserId} />
      </Suspense>
    </RoleGuard>
  );
}
