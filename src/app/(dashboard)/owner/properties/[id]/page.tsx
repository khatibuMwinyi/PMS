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

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;

  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <Suspense fallback={<div>Loading property details...</div>}>
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
