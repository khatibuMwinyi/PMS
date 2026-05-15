import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PropertyDetail } from '@/features/properties/components/PropertyDetail';
import { getPropertyForOwner } from '@/features/properties/actions';

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <Suspense fallback={<div>Loading property details...</div>}>
        <PropertyDetailContent propertyId={params.id} />
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
    <DashboardShell
      role="OWNER"
      userName={
        session.user.name ||
        `${session.user.email?.split('@')[0] || 'User'}`
      }
      pageTitle={property.name}
    >
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
    </DashboardShell>
  );
}

export async function generateMetadata({ params }: PropertyDetailPageProps) {
  return {
    title: `Property Details — Oweru`,
  };
}
