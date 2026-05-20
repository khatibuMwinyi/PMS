'use server';

import { prisma } from '@/core/database/client';

/**
 * Get provider profile with performance metrics
 */
export async function getProviderProfile(providerId: string) {
  const provider = await prisma.providerProfile.findUnique({
    where: { id: providerId },
    include: {
      user: {
        select: { id: true, email: true, status: true },
      },
      wallet: {
        select: {
          id: true,
          availableBalance: true,
          pendingBalance: true,
        },
      },
      _count: { select: { assignments: true } },
    },
  });

  if (!provider) return null;

  const totalAssignments = provider._count.assignments;
  const completedAssignments = await prisma.assignment.count({
    where: {
      providerId: providerId,
      status: 'COMPLETED',
    },
  });

  const completionRate = totalAssignments > 0
    ? (completedAssignments / totalAssignments) * 100
    : 0;

  const acceptedAssignments = await prisma.assignment.count({
    where: {
      providerId: providerId,
      status: 'ACCEPTED',
    },
  });

  const acceptanceRate = totalAssignments > 0
    ? (acceptedAssignments / totalAssignments) * 100
    : 0;

  return {
    ...provider,
    completionRate,
    acceptanceRate,
    totalAssignments,
  };
}

/**
 * Update provider location
 */
export async function updateProviderLocation(
  providerId: string,
  latitude: number,
  longitude: number
) {
  return await prisma.providerProfile.update({
    where: { id: providerId },
    data: {
      latitude,
      longitude,
    },
  });
}

/**
 * Get providers within a radius
 */
export async function getProvidersWithinRadius(
  latitude: number,
  longitude: number,
  radiusKm: number
) {
  return await prisma.providerProfile.findMany({
    where: {
      user: {
        status: 'ACTIVE',
      },
      latitude: {
        not: null,
      },
      longitude: {
        not: null,
      },
    },
    select: {
      id: true,
      businessName: true,
      serviceCategories: true,
      latitude: true,
      longitude: true,
      rating: true,
      completedJobs: true,
      totalJobs: true,
      acceptanceRate: true,
      responsiveness: true,
    },
  });
}

export interface ProviderSettingsSnapshot {
  profile: {
    id: string;
    businessName: string;
    mobileMoneyNumber: string | null;
    serviceCategories: string[];
    serviceRadiusKm: number;
  };
  blockedDates: Array<{ id: string; date: string }>;
  serviceCatalog: Array<{ id: string; name: string }>;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getProviderSettings(
  userId: string,
): Promise<ProviderSettingsSnapshot | null> {
  const [profile, catalog] = await Promise.all([
    prisma.providerProfile.findUnique({
      where: { userId },
      include: {
        blockedDates: {
          select: { id: true, blockedDate: true },
        },
      },
    }),
    prisma.serviceType.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!profile) return null;

  const blockedDates = profile.blockedDates
    .map((b) => ({ id: b.id, date: toIsoDate(b.blockedDate) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    profile: {
      id: profile.id,
      businessName: profile.businessName,
      mobileMoneyNumber: profile.mobileMoneyNumber,
      serviceCategories: profile.serviceCategories,
      serviceRadiusKm: profile.serviceRadiusKm,
    },
    blockedDates,
    serviceCatalog: catalog.map((c) => ({ id: c.id, name: c.name })),
  };
}