import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { PropertyDetail } from '@/features/properties/components/PropertyDetail';
import { getPropertyForOwner } from '@/features/properties/actions';

interface PropertyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function PropertyDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5 max-w-5xl animate-pulse">
      <div
        className="w-full rounded-[var(--radius-xl)] bg-surface-card border border-border-subtle"
        style={{ aspectRatio: '16/7' }}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-[var(--radius-lg)] bg-surface-card border border-border-subtle" />
        ))}
      </div>
      <div className="h-12 rounded-[var(--radius-md)] bg-surface-card border border-border-subtle" />
    </div>
  );
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;

  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <Suspense fallback={<PropertyDetailSkeleton />}>
        <PropertyDetailContent propertyId={id} />
      </Suspense>
    </RoleGuard>
  );
}

async function PropertyDetailContent({ propertyId }: { propertyId: string }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  let property;
  try {
    property = await getPropertyForOwner(propertyId);
  } catch (error) {
    notFound();
  }

  if (!property) {
    notFound();
  }

  return (
    <PropertyDetail
        property={{
          id:               property.id,
          name:             property.name,
          encryptedAddress: property.encryptedAddress,
          zone:             property.zone,
          type:             (property as any).type || 'residential',
          status:           (property as any).status || 'active',
          imageUrls:        property.imageUrls || [],
          units:            property.units || [],
          createdAt:        property.createdAt,
          updatedAt:        property.updatedAt,
          _count:           (property as any)._count,
        }}
        isOwner={true}
      />
  );
}

export async function generateMetadata({ params }: PropertyDetailPageProps) {
  await params;
  return {
    title: `Property Details — Oweru`,
  };
}
