import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { prisma } from '@/core/database/client';
import { getAllServiceTypes } from '@/lib/api/services';
import RoleGuard from '@/components/RoleGuard';
import OwnerServicesSkeleton from '@/components/dashboard/OwnerServicesSkeleton';
import { ServiceRequestForm } from './ServiceRequestForm';

export const dynamic = 'force-dynamic';

export default async function OwnerNewServicePage() {
  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <Suspense fallback={<OwnerServicesSkeleton />}>
        <NewServiceContent />
      </Suspense>
    </RoleGuard>
  );
}

async function NewServiceContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  const profile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const services = await getAllServiceTypes();
  const properties = profile
    ? await prisma.property.findMany({
        where: { ownerId: profile.id },
        select: {
          id: true,
          name: true,
          units: { select: { id: true, unitName: true } },
        },
        orderBy: { name: 'asc' },
      })
    : [];

  return (
    <>
      <Link
        href="/owner/services"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-3"
      >
        <ArrowLeft size={14} /> Back to Services
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Request a Service</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Pricing is locked for 24 hours once quoted. You contract with Oweru only.
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-md border border-dashed border-outline-variant bg-[var(--surface-container-lowest)] p-12 text-center">
          <p className="text-sm text-[var(--text-muted)] mb-3">
            Add a property first before requesting a service.
          </p>
          <Link
            href="/owner/properties/new"
            className="text-sm font-medium text-[var(--brand-gold)] hover:underline"
          >
            Add a property →
          </Link>
        </div>
      ) : (
        <ServiceRequestForm services={services} properties={properties} />
      )}
    </>
  );
}
