import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { prisma } from '@/core/database/client';
import { getAllServiceTypes } from '@/lib/api/services';
import RoleGuard from '@/components/RoleGuard';
import { Suspense } from 'react';
import OwnerServicesSkeleton from '@/components/dashboard/OwnerServicesSkeleton';
import { ServiceRequestForm } from './ServiceRequestForm';

export const dynamic = 'force-dynamic';

export default async function OwnerServicesPage() {
  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <Suspense fallback={<OwnerServicesSkeleton />}>
        <OwnerServicesContent />
      </Suspense>
    </RoleGuard>
  );
}

async function OwnerServicesContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  const services = await getAllServiceTypes();
  const properties = await prisma.property.findMany({
    where: { ownerId: session.user.id },
    select: {
      id: true,
      name: true,
      units: { select: { id: true, unitName: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-semibold text-[var(--text-primary)]">Services</h1>
        <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Browse and request services for your properties
        </p>
      </div>
      <ServiceRequestForm services={services} properties={properties} />
    </div>
  );
}