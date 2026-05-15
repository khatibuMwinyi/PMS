'use server';

// Task Execution actions
import { prisma } from '@/core/database/client';
import { nanoid } from 'nanoid';
import { addHours, addDays, addWeeks } from 'date-fns';
import { Decimal } from '@prisma/client/runtime/library';
import { processServicePayment } from '@/features/wallets/actions';

function redactPII(text: string): string {
  return text
    .replace(/\S+@\S+\.\S+/g, '[EMAIL]')
    .replace(/\+\d{10,}/g, '[PHONE]');
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface LocationVerificationResult {
  verified: boolean;
  method: 'GPS' | 'PHOTO_FALLBACK' | 'MANUAL_REVIEW';
  distance?: number;
  accuracy?: number | null;
  reason?: string;
  propertyLat?: number;
  propertyLng?: number;
}

export async function verifyLocation(
  taskId: string,
  providerLat: number,
  providerLng: number,
  accuracy: number | null = null,
  hasPhotoFallback: boolean = false,
): Promise<LocationVerificationResult> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignment: { include: { property: true } } },
  });

  if (!task) throw new Error('Task not found');
  if (!task.assignment) throw new Error('Task has no assignment');

  const propertyLat = task.assignment.property.latitude;
  const propertyLng = task.assignment.property.longitude;
  const distance = haversineDistance(providerLat, providerLng, propertyLat, propertyLng);

  if (accuracy !== null && accuracy > 100) {
    return {
      verified: false,
      method: 'MANUAL_REVIEW',
      distance,
      accuracy,
      reason: `GPS accuracy too low (${accuracy}m) - requires manual review`,
      propertyLat,
      propertyLng,
    };
  }

  if (distance <= 200) {
    return { verified: true, method: 'GPS', distance, accuracy, propertyLat, propertyLng };
  }

  if (distance <= 500 && hasPhotoFallback) {
    return {
      verified: false,
      method: 'PHOTO_FALLBACK',
      distance,
      accuracy,
      reason: 'Outside GPS radius - photo verification required',
      propertyLat,
      propertyLng,
    };
  }

  return {
    verified: false,
    method: 'MANUAL_REVIEW',
    distance,
    accuracy,
    reason: 'Location verification failed - requires manual review',
    propertyLat,
    propertyLng,
  };
}

export async function checkInToTask(
  taskId: string,
  providerLat: number,
  providerLng: number,
  options: {
    accuracy?: number | null;
    hasPhotoFallback?: boolean;
    forceManualReview?: boolean;
  } = {},
): Promise<{ success: boolean; method?: string; reason?: string }> {
  const { accuracy = null, hasPhotoFallback = false, forceManualReview = false } = options;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignment: { include: { property: true } } },
  });
  if (!task) throw new Error('Task not found');

  if (forceManualReview) {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'PENDING_REVIEW',
        manualReviewReason: 'Manual check-in requested',
        manualReviewRequestedAt: new Date(),
        checkInTime: new Date(),
      },
    });
    return { success: false, method: 'MANUAL_REVIEW', reason: 'Manual review required for check-in' };
  }

  const verification = await verifyLocation(taskId, providerLat, providerLng, accuracy, hasPhotoFallback);

  if (verification.verified) {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'IN_PROGRESS',
        checkInTime: new Date(),
        checkInLatitude: providerLat,
        checkInLongitude: providerLng,
        checkInMethod: 'GPS',
      },
    });
    if (task.assignment) {
      await prisma.assignment.update({
        where: { id: task.assignment.id },
        data: { status: 'IN_PROGRESS' },
      });
    }
    return { success: true, method: 'GPS' };
  }

  if (verification.method === 'PHOTO_FALLBACK') {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'IN_PROGRESS',
        checkInTime: new Date(),
        checkInMethod: 'PHOTO_FALLBACK',
        pendingPhotoVerification: true,
      },
    });
    return { success: false, method: 'PHOTO_FALLBACK', reason: verification.reason };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: 'PENDING_REVIEW',
      manualReviewReason: verification.reason,
      manualReviewRequestedAt: new Date(),
      checkInTime: new Date(),
    },
  });

  await prisma.staffTicket.create({
    data: {
      id: nanoid(),
      type: 'TECHNICAL',
      priority: 'MEDIUM',
      title: `GPS verification failed - Task ${taskId}`,
      content: {
        taskId,
        providerDistance: verification.distance,
        gpsAccuracy: verification.accuracy,
        reason: verification.reason,
        providerLocation: { lat: providerLat, lng: providerLng },
        propertyLocation: {
          lat: verification.propertyLat,
          lng: verification.propertyLng,
        },
      },
      status: 'PENDING',
    },
  });

  return { success: false, method: 'MANUAL_REVIEW', reason: verification.reason };
}

/**
 * Provider submits completion evidence (>=3 images).
 * Opens 24h dispute window. Next recurring task generated on verification.
 */
export async function submitTaskEvidence(taskId: string, imageUrls: string[]): Promise<void> {
  if (imageUrls.length < 3) {
    throw new Error('At least 3 evidence photos are required.');
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignment: true },
  });
  if (!task) throw new Error('Task not found');

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        checkOutTime: new Date(),
        evidenceImages: imageUrls,
      },
    });

    if (task.assignment) {
      await tx.assignment.update({
        where: { id: task.assignment.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    }
  });
}

/**
 * Auto-verify tasks whose 24h dispute window has passed without dispute.
 * Triggers payment saga with the Assignment.totalAmount (not basePrice).
 */
export async function autoVerifyPendingTasks(): Promise<void> {
  const now = new Date();
  const cutoff = addHours(now, -24);

  const candidates = await prisma.task.findMany({
    where: {
      status: 'COMPLETED',
      checkOutTime: { lte: cutoff },
      dispute: null,
    },
    include: { assignment: true },
  });

  for (const t of candidates) {
    if (!t.assignment) continue;

    await prisma.task.update({
      where: { id: t.id },
      data: { status: 'VERIFIED', verifiedAt: now },
    });

    await prisma.assignment.update({
      where: { id: t.assignment.id },
      data: { status: 'VERIFIED', verifiedAt: now },
    });

    await processServicePayment(t.assignment.id, t.assignment.totalAmount.toString());
    await scheduleNextRecurrence(t.assignment.id, t.scheduledFor);
  }
}

/**
 * Generate next recurring task based on Agreement.frequency.
 */
async function scheduleNextRecurrence(assignmentId: string, lastScheduledFor: Date): Promise<void> {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { agreement: true },
  });
  if (!assignment?.agreement) return;
  if (assignment.agreement.status !== 'ACTIVE') return;

  let next: Date;
  switch (assignment.agreement.frequency) {
    case 'WEEKLY':
      next = addWeeks(lastScheduledFor, 1);
      break;
    case 'BIWEEKLY':
      next = addWeeks(lastScheduledFor, 2);
      break;
    case 'MONTHLY':
      next = addDays(lastScheduledFor, 30);
      break;
    default:
      return;
  }

  await prisma.task.create({
    data: {
      id: nanoid(),
      assignmentId,
      scheduledFor: next,
      status: 'SCHEDULED',
    },
  });
}

/**
 * Owner initiates dispute on a completed task (delegates to disputes feature).
 */
export async function initiateDispute(taskId: string, reason: string): Promise<void> {
  const { createDispute } = await import('@/features/disputes/actions');
  await createDispute(taskId, reason);
}

/**
 * Staff dispute view with redacted notes.
 */
export async function getDisputeForStaffReview(disputeId: string): Promise<{
  reason: string;
  evidenceImages: string[];
  redactedNotes: string;
}> {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { task: true },
  });
  if (!dispute) throw new Error('Dispute not found');

  return {
    reason: dispute.reason,
    evidenceImages: dispute.task?.evidenceImages ?? [],
    redactedNotes: redactPII(`Dispute reason: ${dispute.reason}`),
  };
}
