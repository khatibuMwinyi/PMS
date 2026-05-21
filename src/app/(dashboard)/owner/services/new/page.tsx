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
      <div className="mb-8">
        <Link
          href="/owner/services"
          className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Services
        </Link>
        <h1 className="font-serif text-h2 text-text-primary tracking-tight">
          Request a Service
        </h1>
        <p className="text-body-sm text-text-secondary mt-1">
          Pricing is locked for 24 hours once quoted. You contract with Oweru only.
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-md border border-dashed border-border-subtle bg-surface-card p-12 text-center">
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
