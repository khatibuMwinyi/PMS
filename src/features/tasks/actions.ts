// Task Execution actions (Phase 4)
import { prisma } from '@/core/database/client';
import { nanoid } from 'nanoid';
import { addHours } from 'date-fns';
import { processServicePayment } from '@/features/wallets/actions'; // saga from Phase 3

/**
 * Helper: calculate distance (meters) between two lat/lng points using the Haversine formula.
 */
function redactPII(text: string): string {
  return text.replace(/\S+@\S+\.\S+/g, '[EMAIL]').replace(/\+\d{10,}/g, '[PHONE]');
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Enhanced location verification with multiple fallback modes
 */
export interface LocationVerificationResult {
  verified: boolean;
  method: 'GPS' | 'PHOTO_FALLBACK' | 'MANUAL_REVIEW';
  distance?: number;
  accuracy?: number;
  reason?: string;
}

/**
 * Verify provider location with enhanced GPS and fallback options
 */
export async function verifyLocation(
  taskId: string,
  providerLat: number,
  providerLng: number,
  accuracy: number | null = null,
  hasPhotoFallback: boolean = false
): Promise<LocationVerificationResult> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignment: { include: { property: true } } },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  if (!task.assignment) {
    throw new Error('Task has no assignment');
  }

  const { latitude: propLat, longitude: propLng } = task.assignment.property;
  const distance = haversineDistance(providerLat, providerLng, propLat, propLng);

  // Check GPS accuracy if available
  if (accuracy !== null && accuracy > 100) {
    // High GPS error - flag for manual review
    return {
      verified: false,
      method: 'MANUAL_REVIEW',
      distance,
      accuracy,
      reason: `GPS accuracy too low (${accuracy}m) - requires manual review`,
    };
  }

  // Standard GPS verification
  if (distance <= 200) {
    return {
      verified: true,
      method: 'GPS',
      distance,
      accuracy,
    };
  }

  // Check if within extended radius with photo fallback
  if (distance <= 500 && hasPhotoFallback) {
    return {
      verified: false,
      method: 'PHOTO_FALLBACK',
      distance,
      accuracy,
      reason: 'Outside GPS radius - photo verification required',
    };
  }

  // Outside all acceptable ranges
  return {
    verified: false,
    method: 'MANUAL_REVIEW',
    distance,
    accuracy,
    reason: 'Location verification failed - requires manual review',
  };
}

/**
 * Provider checks in to a task.
 * Uses enhanced verification with multiple fallback options.
 */
export async function checkInToTask(
  taskId: string,
  providerLat: number,
  providerLng: number,
  options: {
    accuracy?: number | null;
    hasPhotoFallback?: boolean;
    forceManualReview?: boolean;
  } = {}
): Promise<{ success: boolean; method?: string; reason?: string }> {
  const {
    accuracy = null,
    hasPhotoFallback = false,
    forceManualReview = false,
  } = options;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignment: { include: { property: true } } },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  // Always update task status to IN_PROGRESS
  const updates: any = {
    status: 'IN_PROGRESS',
    checkInTime: new Date(),
  };

  if (forceManualReview) {
    // Force manual review mode
    updates.status = 'PENDING_REVIEW';
    updates.manualReviewReason = 'Manual check-in requested';

    await prisma.task.update({ where: { id: taskId }, data: updates });

    return {
      success: false,
      method: 'MANUAL_REVIEW',
      reason: 'Manual review required for check-in',
    };
  }

  // Verify location
  const verification = await verifyLocation(
    taskId,
    providerLat,
    providerLng,
    accuracy,
    hasPhotoFallback
  );

  if (verification.verified) {
    // GPS verification successful
    updates.checkInLatitude = providerLat;
    updates.checkInLongitude = providerLng;
    updates.checkInMethod = 'GPS';

    await prisma.task.update({ where: { id: taskId }, data: updates });

    return {
      success: true,
      method: 'GPS',
    };
  }

  if (verification.method === 'PHOTO_FALLBACK') {
    // Photo fallback required
    updates.checkInMethod = 'PHOTO_FALLBACK';
    updates.pendingPhotoVerification = true;

    await prisma.task.update({ where: { id: taskId }, data: updates });

    return {
      success: false,
      method: 'PHOTO_FALLBACK',
      reason: verification.reason,
    };
  }

  // Manual review required
  updates.status = 'PENDING_REVIEW';
  updates.manualReviewReason = verification.reason;
  updates.manualReviewRequestedAt = new Date();

  await prisma.task.update({ where: { id: taskId }, data: updates });

  // Create manual review ticket
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
        propertyLocation: { lat: propLat, lng: propLng },
      },
      status: 'PENDING',
    },
  });

  return {
    success: false,
    method: 'MANUAL_REVIEW',
    reason: verification.reason,
  };
}

/**
 * Submit evidence for a completed task.
 * Requires at least three image URLs.
 * Sets task status to COMPLETED and schedules a 24‑hour window for disputes.
 * If no dispute is filed, the funds are released via the payment saga.
 */
export async function submitTaskEvidence(
  taskId: string,
  imageUrls: string[],
): Promise<void> {
  if (imageUrls.length < 3) {
    throw new Error('At least 3 evidence photos are required.');
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error('Task not found');

  // Update task record with evidence and mark completed
  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: 'COMPLETED',
      checkOutTime: new Date(),
      evidenceImages: imageUrls,
    },
  });

  // Create a dispute placeholder that expires in 24 h. If the owner never creates a real dispute, the row will expire and we can auto‑verify.
  const expiresAt = addHours(new Date(), 24);
  await prisma.dispute.create({
    data: {
      id: nanoid(),
      taskId,
      reason: 'AUTO_VERIFICATION_PENDING',
      expiresAt,
    },
  });

  // Schedule auto‑verification. In a real system you would enqueue a background job (e.g., pg‑boss).
  // For this implementation we simply rely on a periodic job elsewhere to call `autoVerifyPendingTasks`.
}

/**
 * Called by a scheduled job (e.g., nightly worker) to automatically verify tasks whose dispute window has passed.
 * When verified, it triggers the payment split saga.
 */
export async function autoVerifyPendingTasks(): Promise<void> {
  const now = new Date();
  const pending = await prisma.dispute.findMany({
    where: { expiresAt: { lte: now }, status: 'OPEN' },
    include: { task: true },
  });

  for (const d of pending) {
    // Mark dispute as resolved without owner action
    await prisma.dispute.update({
      where: { id: d.id },
      data: { status: 'EXPIRED', resolvedAt: now },
    });
    // Trigger payment saga for the related assignment
    if (d.task && d.task.assignmentId) {
      // Retrieve the total amount from the assignment (assume it's stored as `price` on the assignment or service)
      const assignment = await prisma.assignment.findUnique({
        where: { id: d.task.assignmentId },
        include: { serviceType: { select: { basePrice: true } } },
      });
      if (!assignment) throw new Error('Assignment not found for payment');
      // Use the service's base price as the total amount for the payout
      const totalAmount = assignment.serviceType.basePrice.toNumber();
      await processServicePayment(assignment.id, totalAmount);
    }
  }
}

/**
 * Owner initiates a dispute within the 24‑hour window.
 */
export async function initiateDispute(taskId: string, reason: string): Promise<void> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error('Task not found');

  // Update task status
  await prisma.task.update({ where: { id: taskId }, data: { status: 'DISPUTED' } });

  // Create dispute record (expires at original 24h deadline)
  const expiresAt = addHours(new Date(), 24);
  await prisma.dispute.create({
    data: {
      id: nanoid(),
      taskId,
      reason,
      expiresAt,
    },
  });
}

/**
 * Staff fetches dispute details, with evidence redacted via Gemini.
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

  const notes = `Dispute reason: ${dispute.reason}`;
  const redactedNotes = redactPII(notes);

  return {
    reason: dispute.reason,
    evidenceImages: dispute.task?.evidenceImages ?? [],
    redactedNotes,
  };
}
