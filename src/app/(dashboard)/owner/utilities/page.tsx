import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { UtilityForm } from '@/features/utilities/components/UtilityForm';
import { UtilityTable } from '@/features/utilities/components/UtilityTable';
import { getOwnerPropertiesForUtility } from '@/features/utilities/services';

export const dynamic = 'force-dynamic';

export default async function OwnerUtilitiesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  const ownerUserId = session.user.id;
  const properties = await getOwnerPropertiesForUtility(ownerUserId);

  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <DashboardHeader
        title="Utilities"
        subtitle="Track water, electricity, gas, and waste bills separately from Oweru services."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <UtilityForm properties={properties} />
        </div>
        <div className="lg:col-span-2">
          <Suspense
            fallback={
              <div className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md h-64 animate-pulse" />
            }
          >
            <UtilityTable ownerUserId={ownerUserId} />
          </Suspense>
        </div>
      </div>
    </RoleGuard>
  );
}
