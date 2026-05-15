'use server';

import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';

export interface DashboardFinancials {
  totalSpend: string;
  activeRequests: number;
  maintenanceROI: string;
}

export interface DashboardProperty {
  id: string;
  name: string;
  type: string;
  address: string;
  units: number;
  occupancy: number;
  imageUrl?: string;
}

export async function getDashboardFinancials(): Promise<DashboardFinancials> {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!ownerProfile) {
    return { totalSpend: '$0.00', activeRequests: 0, maintenanceROI: '0%' };
  }

  const agreements = await prisma.agreement.findMany({
    where: {
      ownerId: session.user.id,
      status: { not: 'QUOTED' },
    },
  });

  const totalSpend = agreements.reduce(
    (sum, ag) => sum + Number(ag.quotedPrice),
    0,
  );

  const activeRequests = await prisma.quote.count({
    where: {
      ownerId: session.user.id,
      status: { in: ['QUOTED', 'ACCEPTED'] },
    },
  });

  const completedAgreements = agreements.filter((a) => a.status === 'COMPLETED').length;
  const roi =
    agreements.length > 0
      ? ((completedAgreements / agreements.length) * 100).toFixed(1) + '%'
      : '0%';

  return {
    totalSpend: `$${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    activeRequests,
    maintenanceROI: roi,
  };
}

export async function getDashboardProperties(): Promise<DashboardProperty[]> {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      ownerProfile: {
        include: {
          properties: {
            include: {
              units: true,
              quotes: { where: { status: { in: ['QUOTED', 'ACCEPTED'] } } },
            },
          },
        },
      },
    },
  });

  if (!user?.ownerProfile?.properties) return [];

  return user.ownerProfile.properties.map((property) => ({
    id: property.id,
    name: property.name,
    type: property.type,
    address: property.zone || 'Address not set',
    units: property.units.length,
    occupancy: 0,
    imageUrl: property.imageUrls?.[0],
  }));
}
