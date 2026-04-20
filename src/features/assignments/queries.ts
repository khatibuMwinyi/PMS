'use server';

import { prisma }  from '@/core/database/client';
import { auth }    from '@/core/auth';
import type { AssignmentWithDetails } from './types';

/**
 * Fetch all PENDING_ACCEPTANCE assignments for the logged-in provider.
 *
 * ⚠ Isolation Principle enforced here:
 *   • Only `property.zone` is selected — NEVER encryptedAddress, ownerId, or owner relations.
 *   • Provider sees the neighbourhood, the service type, and the countdown — nothing else.
 */
export async function getProviderPendingAssignments(): Promise<AssignmentWithDetails[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'PROVIDER') {
    throw new Error('Unauthorized');
  }

  const provider = await prisma.providerProfile.findUnique({
    where:  { userId: session.user.id },
    select: { id: true },
  });

  if (!provider) return [];

  const assignments = await prisma.assignment.findMany({
    where: {
      providerId: provider.id,
      status:     'PENDING_ACCEPTANCE',
      expiresAt:  { gt: new Date() },    // Only unexpired offers
    },
    select: {
      id:        true,
      status:    true,
      expiresAt: true,
      version:   true,
      serviceType: {
        select: {
          name:         true,
          pricingRules: true,   // contains category metadata
        },
      },
      property: {
        select: {
          zone:      true,   // ✅ neighbourhood — safe for provider view
          latitude:  true,
          longitude: true,
          // encryptedAddress: intentionally OMITTED
          // ownerId:           intentionally OMITTED
          // owner relation:    intentionally OMITTED
        },
      },
    },
    orderBy: { expiresAt: 'asc' },   // Soonest-expiring first
  });

  // Shape for client — convert Date to ISO string
  return assignments.map((a) => ({
    id:         a.id,
    status:     a.status as AssignmentWithDetails['status'],
    expiresAt:  a.expiresAt.toISOString(),
    version:    a.version,
    serviceType: {
      name:     a.serviceType.name,
    },
    property: {
      zone:      a.property.zone,
      latitude:  a.property.latitude,
      longitude: a.property.longitude,
    },
  }));
}