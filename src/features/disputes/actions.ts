'use server';

import { prisma } from '@/core/database/client';
import {
  redactDisputeEvidence,
  containsPII,
  getPIITypes
} from '@/core/security/pii-redaction';
import { nanoid } from 'nanoid';
import { addHours } from 'date-fns';

/**
 * Create a new dispute
 */
export async function createDispute(
  taskId: string,
  reason: string,
  evidence?: {
    images: string[];
    notes: string;
  }
) {
  // Get the task first
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignment: true },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  // Update task status to DISPUTED
  await prisma.task.update({
    where: { id: taskId },
    data: { status: 'DISPUTED' },
  });

  // Check for PII in evidence
  const hasPII = evidence ? containsPII(evidence.notes) : false;
  const piiTypes = evidence ? getPIITypes(evidence.notes) : [];

  // Create dispute record
  const dispute = await prisma.dispute.create({
    data: {
      id: nanoid(),
      taskId,
      reason,
      hasPII,
      piiTypes,
      expiresAt: addHours(new Date(), 24), // 24-hour window
      status: 'OPEN',
    },
  });

  // Create staff ticket
  await prisma.staffTicket.create({
    data: {
      id: nanoid(),
      type: 'DISPUTE',
      priority: hasPII ? 'HIGH' : 'MEDIUM',
      title: `Dispute for Task ${taskId}`,
      content: {
        taskId,
        reason,
        hasPII,
        piiTypes,
        evidence,
      },
      status: 'PENDING',
      assignedTo: null, // Unassigned initially
    },
  });

  return dispute;
}

/**
 * Get dispute details for staff review
 */
export async function getDisputeForReview(disputeId: string) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      task: {
        include: {
          assignment: {
            include: {
              provider: {
                select: {
                  businessName: true,
                  user: {
                    select: { id: true },
                  },
                },
              },
              property: {
                select: {
                  name: true,
                  zone: true,
                },
              },
              serviceType: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      staffTicket: true,
    },
  });

  if (!dispute) {
    throw new Error('Dispute not found');
  }

  // Redact evidence if it contains PII
  const redactedEvidence = dispute.task?.evidence
    ? redactDisputeEvidence(dispute.task.evidence)
    : null;

  return {
    ...dispute,
    task: {
      ...dispute.task,
      evidence: redactedEvidence,
    },
  };
}

/**
 * Resolve a dispute
 */
export async function resolveDispute(
  disputeId: string,
  resolution: {
    action: 'FULL_REFUND' | 'FULL_RELEASE' | 'SPLIT_DECISION';
    amount?: number; // For SPLIT_DECISION
    notes: string;
  }
) {
  // Get dispute details
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { task: { include: { assignment: true } } },
  });

  if (!dispute) {
    throw new Error('Dispute not found');
  }

  // Update dispute status
  await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: 'RESOLVED',
      resolvedAt: new Date(),
      resolution,
    },
  });

  // Update staff ticket
  await prisma.staffTicket.update({
    where: { id: dispute.staffTicketId },
    data: {
      status: 'RESOLVED',
      resolution,
    },
  });

  // Handle financial adjustments based on resolution
  if (dispute.task?.assignment) {
    const assignment = dispute.task.assignment;

    switch (resolution.action) {
      case 'FULL_REFUND':
        // Process refund to owner
        await prisma.financialAuditLog.create({
          data: {
            id: nanoid(),
            entityType: 'DISPUTE',
            entityId: disputeId,
            action: 'REFUND_ISSUED',
            payload: {
              assignmentId: assignment.id,
              amount: assignment.serviceType.basePrice,
              reason: 'Dispute resolution - full refund',
            },
          },
        });
        break;

      case 'FULL_RELEASE':
        // Release funds to provider
        await prisma.financialAuditLog.create({
          data: {
            id: nanoid(),
            entityType: 'DISPUTE',
            entityId: disputeId,
            action: 'PAYMENT_RELEASED',
            payload: {
              assignmentId: assignment.id,
              amount: assignment.serviceType.basePrice,
              reason: 'Dispute resolution - full release',
            },
          },
        });
        break;

      case 'SPLIT_DECISION':
        // Split payment based on amount
        if (resolution.amount) {
          const ownerAmount = assignment.serviceType.basePrice.minus(resolution.amount);
          const providerAmount = resolution.amount;

          await prisma.financialAuditLog.create({
            data: {
              id: nanoid(),
              entityType: 'DISPUTE',
              entityId: disputeId,
              action: 'SPLIT_PAYMENT',
              payload: {
                assignmentId: assignment.id,
                ownerAmount: ownerAmount.toString(),
                providerAmount: providerAmount.toString(),
                reason: 'Dispute resolution - split decision',
              },
            },
          });
        }
        break;
    }
  }

  return { success: true };
}

/**
 * Get all open disputes for staff
 */
export async function getOpenDisputes() {
  return await prisma.dispute.findMany({
    where: {
      status: 'OPEN',
      expiresAt: { gt: new Date() },
    },
    include: {
      task: {
        include: {
          assignment: {
            include: {
              provider: {
                select: {
                  businessName: true,
                },
              },
              property: {
                select: {
                  name: true,
                  zone: true,
                },
              },
              serviceType: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      staffTicket: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Auto-expire old disputes
 */
export async function autoExpireDisputes() {
  const expiredDisputes = await prisma.dispute.findMany({
    where: {
      status: 'OPEN',
      expiresAt: { lt: new Date() },
    },
  });

  for (const dispute of expiredDisputes) {
    await prisma.dispute.update({
      where: { id: dispute.id },
      data: {
        status: 'EXPIRED',
        resolvedAt: new Date(),
      },
    });
  }

  return expiredDisputes.length;
}