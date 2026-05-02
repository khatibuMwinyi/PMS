"use server";

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

/**
 * Get financial summary for the current owner
 */
export async function getDashboardFinancials(): Promise<DashboardFinancials> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Get owner profile
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!ownerProfile) {
    return { totalSpend: '$0.00', activeRequests: 0, maintenanceROI: '0%' };
  }

  // Calculate total spend from accepted quotes/agreements
  const agreements = await prisma.agreement.findMany({
    where: {
      ownerId: session.user.id,
      status: { not: 'QUOTED' },
    },
  });

  const totalSpend = agreements.reduce((sum, ag) => sum + ag.quotedPrice, 0);

  // Count active requests (quotes in QUOTED or ACCEPTED status)
  const activeRequests = await prisma.quote.count({
    where: {
      ownerId: session.user.id,
      status: { in: ['QUOTED', 'ACCEPTED'] },
    },
  });

  // Calculate ROI (simplified: based on completed agreements vs total)
  const completedAgreements = agreements.filter(a => a.status === 'COMPLETED').length;
  const roi = agreements.length > 0 
    ? ((completedAgreements / agreements.length) * 100).toFixed(1) + '%'
    : '0%';

  return {
    totalSpend: `$${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    activeRequests,
    maintenanceROI: roi,
  };
}

/**
 * Get properties for the current owner
 */
export async function getDashboardProperties(): Promise<DashboardProperty[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      ownerProfile: {
        include: {
          properties: {
            include: {
              units: true,
              quotes: {
                where: { status: { in: ['QUOTED', 'ACCEPTED'] } },
              },
            },
          },
        },
      },
    },
  });

  if (!user?.ownerProfile?.properties) {
    return [];
  }

  return user.ownerProfile.properties.map(property => {
    const activeQuotes = property.quotes.length;
    const occupancy = property.units.length > 0 
      ? Math.round((property.units.filter(u => u.status === 'OCCUPIED').length / property.units.length) * 100)
      : 0;

    return {
      id: property.id,
      name: property.name,
      type: property.type,
      address: property.locationText || 'Address not set',
      units: property.units.length,
      occupancy,
      imageUrl: property.imageUrls?.[0],
    };
  });
}
