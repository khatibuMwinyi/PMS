'use server';

import { prisma }  from '@/core/database/client';
import { auth }    from '@/core/auth';
import type { AssignmentWithDetails, PaginatedAssignments } from './types';

/**
 * Fetch all PENDING_ACCEPTANCE assignments for the logged-in provider.
 *
 * ⚠ Isolation Principle enforced here:
 *   • Only `property.zone` is selected — NEVER encryptedAddress, ownerId, or owner relations.
 *   • Provider sees the neighbourhood, the service type, and the countdown — nothing else.
 */
export async function getProviderPendingAssignments(page: number = 1, pageSize: number = 20): Promise<PaginatedAssignments> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'PROVIDER') {
    throw new Error('Unauthorized');
  }

  const provider = await prisma.providerProfile.findUnique({
    where:  { userId: session.user.id },
    select: { id: true },
  });

  if (!provider) return { assignments: [], total: 0, page, pageSize };

  // Get total count for pagination metadata
  const total = await prisma.assignment.count({
    where: {
      providerId: provider.id,
      status:     'PENDING_ACCEPTANCE',
      expiresAt:  { gt: new Date() },
    },
  });

  const skip = (page - 1) * pageSize;

  const assignments = await prisma.assignment.findMany({
    where: {
      providerId: provider.id,
      status:     'PENDING_ACCEPTANCE',
      expiresAt:  { gt: new Date() },
    },
    select: {
      id:        true,
      status:    true,
      expiresAt: true,
      version:   true,
      serviceType: {
        select: {
          name:         true,
          pricingRules: true,
        },
      },
      property: {
        select: {
          zone:      true,
          latitude:  true,
          longitude: true,
        },
      },
    },
    orderBy: { expiresAt: 'asc' },
    skip,
    take: pageSize,
  });

  // Shape for client — convert Date to ISO string
  const assignmentsMapped = assignments.map((a) => ({
    id:         a.id,
    status:     a.status as AssignmentWithDetails['status'],
    expiresAt:  a.expiresAt.toISOString(),
    version:    a.version,
    serviceType: {
      name: a.serviceType.name,
    },
    property: {
      zone:      a.property.zone,
      latitude:  a.property.latitude,
      longitude: a.property.longitude,
    },
  }));

  return {
    assignments: assignmentsMapped,
    total,
    page,
    pageSize,
  } as PaginatedAssignments;
}