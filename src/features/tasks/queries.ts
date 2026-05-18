'use server';

import { prisma } from '@/core/database/client';

export interface ProviderTaskDetail {
  id: string;
  scheduledFor: string;
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  evidenceImages: string[];
  pendingPhotoVerification: boolean;
  assignment: {
    id: string;
    status: string;
    providerPayoutTZS: string;
    expiresAt: string;
    acceptedAt: string | null;
    scheduledDate: string | null;
    serviceTypeName: string;
  };
  property: {
    zone: string;
    latitude: number;
    longitude: number;
    exactAddress: string | null; // null pre-acceptance
  };
}

/**
 * Statuses at/after which the provider may see the property's exact address.
 * Per Full.md §XXI Isolation Principle: zone is always visible, exact address
 * is withheld until the assignment has been ACCEPTED (or later lifecycle state).
 */
const POST_ACCEPTANCE: ReadonlySet<string> = new Set([
  'ACCEPTED',
  'IN_PROGRESS',
  'COMPLETED',
  'DISPUTED',
  'VERIFIED',
]);

/**
 * Fetch a single task's detail for the logged-in provider.
 *
 * ⚠ Isolation Principle enforced at the select clause:
 *   • Owner relation / ownerId are NEVER selected.
 *   • `property.encryptedAddress` is auto-decrypted by the prisma extension;
 *     it is gated behind POST_ACCEPTANCE and otherwise returned as `null`.
 *
 * @param taskId          Task id to fetch.
 * @param providerUserId  Logged-in user id (NOT providerProfile.id).
 * @returns               Shaped detail object, or `null` if the task is not
 *                        owned by the provider (or the user has no provider profile).
 */
export async function getProviderTaskDetail(
  taskId: string,
  providerUserId: string,
): Promise<ProviderTaskDetail | null> {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId: providerUserId },
    select: { id: true },
  });
  if (!provider) return null;

  const task = await prisma.task.findFirst({
    where: { id: taskId, assignment: { providerId: provider.id } },
    select: {
      id: true,
      scheduledFor: true,
      status: true,
      checkInTime: true,
      checkOutTime: true,
      evidenceImages: true,
      pendingPhotoVerification: true,
      assignment: {
        select: {
          id: true,
          status: true,
          providerPayout: true,
          expiresAt: true,
          acceptedAt: true,
          scheduledDate: true,
          serviceType: { select: { name: true } },
          property: {
            select: {
              zone: true,
              latitude: true,
              longitude: true,
              encryptedAddress: true,
            },
          },
        },
      },
    },
  });
  if (!task) return null;

  const a = task.assignment;
  const revealAddress = POST_ACCEPTANCE.has(a.status);

  return {
    id: task.id,
    scheduledFor: task.scheduledFor.toISOString(),
    status: task.status,
    checkInTime: task.checkInTime?.toISOString() ?? null,
    checkOutTime: task.checkOutTime?.toISOString() ?? null,
    evidenceImages: task.evidenceImages,
    pendingPhotoVerification: task.pendingPhotoVerification,
    assignment: {
      id: a.id,
      status: a.status,
      providerPayoutTZS: a.providerPayout.toString(),
      expiresAt: a.expiresAt.toISOString(),
      acceptedAt: a.acceptedAt?.toISOString() ?? null,
      scheduledDate: a.scheduledDate?.toISOString() ?? null,
      serviceTypeName: a.serviceType.name,
    },
    property: {
      zone: a.property.zone,
      latitude: a.property.latitude,
      longitude: a.property.longitude,
      exactAddress: revealAddress ? a.property.encryptedAddress ?? null : null,
    },
  };
}
