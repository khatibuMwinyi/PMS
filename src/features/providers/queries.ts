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
        select: {
          id: true,
          email: true,
          status: true,
        },
      },
      assignments: {
        where: {
          status: { in: ['ACCEPTED', 'COMPLETED'] },
        },
        _count: true,
      },
      wallet: {
        select: {
          id: true,
          availableBalance: true,
          pendingBalance: true,
        },
      },
    },
  });

  if (!provider) return null;

  // Calculate performance metrics
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