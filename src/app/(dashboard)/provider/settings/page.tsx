import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { getProviderSettings } from '@/features/providers/queries';
import { BusinessProfileForm } from '@/features/providers/components/BusinessProfileForm';
import { CoverageForm } from '@/features/providers/components/CoverageForm';
import { AvailabilityCalendar } from '@/features/providers/components/AvailabilityCalendar';

export const dynamic = 'force-dynamic';

export default function ProviderSettingsPage() {
  return (
    <RoleGuard allowedRoles={['PROVIDER']}>
      <DashboardHeader
        title="Settings"
        subtitle="Profile, coverage, and availability."
        asOf={new Date()}
      />
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </RoleGuard>
  );
}

async function SettingsContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'PROVIDER') redirect('/login');

  const snapshot = await getProviderSettings(session.user.id);
  if (!snapshot) {
    return (
      <div className="rounded-md border border-border-default bg-surface-card p-6 text-text-muted">
        Your provider profile is being verified. Settings will be available once verification completes.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BusinessProfileForm
        initial={{
          businessName: snapshot.profile.businessName,
          mobileMoneyNumber: snapshot.profile.mobileMoneyNumber,
        }}
      />
      <CoverageForm
        initial={{
          serviceCategories: snapshot.profile.serviceCategories,
          serviceRadiusKm: snapshot.profile.serviceRadiusKm,
        }}
        catalog={snapshot.serviceCatalog}
      />
      <AvailabilityCalendar dates={snapshot.blockedDates} />
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-48 rounded-lg bg-surface-overlay animate-pulse" />
      <div className="h-48 rounded-lg bg-surface-overlay animate-pulse" />
      <div className="h-64 rounded-lg bg-surface-overlay animate-pulse" />
    </div>
  );
}
