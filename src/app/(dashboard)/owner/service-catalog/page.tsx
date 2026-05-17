import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { ServiceCatalogGrid } from '@/features/service-catalog/components/ServiceCatalogGrid';
import { ServiceCatalogSkeleton } from '@/features/service-catalog/components/skeletons';

export const dynamic = 'force-dynamic';

export default async function OwnerServiceCatalogPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <DashboardHeader
        title="Service Catalog"
        subtitle="Browse the services Oweru delivers. Pricing is rule-based; you lock a quote for 24 hours when you request."
      />

      <div className="bg-[var(--brand-primary)] text-[var(--text-on-brand)] rounded-md p-5 mb-6 flex items-center gap-4">
        <Sparkles size={24} className="text-[var(--brand-gold)] shrink-0" />
        <div className="flex-1">
          <p className="font-semibold mb-0.5">Single point of contact</p>
          <p className="text-sm text-[var(--text-secondary-on-dark)]">
            Every service in this catalog is delivered by Oweru. You contract with Oweru only — we
            handle assignment, payment, and dispute resolution end to end.
          </p>
        </div>
        <Link
          href="/owner/services/new"
          className="px-4 py-2 bg-[var(--brand-gold)] text-[var(--brand-primary)] rounded-md text-sm font-semibold hover:bg-[var(--brand-gold-dark)] transition-colors shrink-0"
        >
          Request Service
        </Link>
      </div>

      <Suspense fallback={<ServiceCatalogSkeleton />}>
        <ServiceCatalogGrid />
      </Suspense>
    </RoleGuard>
  );
}
