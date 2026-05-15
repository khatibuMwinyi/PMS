'use server';

import { prisma } from '@/core/database/client';
import {
  redactDisputeEvidence,
  containsPII,
  getPIITypes,
} from '@/core/security/pii-redaction';
import { nanoid } from 'nanoid';
import { addHours } from 'date-fns';
import { Decimal } from '@prisma/client/runtime/library';
import type { DisputeResolution } from '@prisma/client';

type EvidencePayload = {
  images: string[];
  notes: string;
};

/**
 * Owner files a dispute against a completed task.
 * Creates StaffTicket (1:1 with dispute) and links via Dispute.staffTicketId.
 */
export async function createDispute(
  taskId: string,
  reason: string,
  evidence?: EvidencePayload,
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignment: true },
  });

  if (!task) throw new Error('Task not found');

  const hasPII = evidence ? containsPII(evidence.notes) : false;
  const piiTypes = evidence ? getPIITypes(evidence.notes) : [];

  return prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: { status: 'DISPUTED' },
    });

    const ticket = await tx.staffTicket.create({
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
          evidence: evidence ?? null,
        },
        status: 'PENDING',
        assignedTo: null,
      },
    });

    const dispute = await tx.dispute.create({
      data: {
        id: nanoid(),
        taskId,
        reason,
        evidence: evidence ? (evidence as unknown as object) : undefined,
        hasPII,
        piiTypes,
        expiresAt: addHours(new Date(), 24),
        status: 'OPEN',
        staffTicketId: ticket.id,
      },
    });

    if (task.assignment) {
      await tx.assignment.update({
        where: { id: task.assignment.id },
        data: {
          status: 'DISPUTED',
          disputedAt: new Date(),
          disputeReason: reason,
        },
      });
    }

    return dispute;
  });
}

/**
 * Staff view — redacts evidence text if PII detected.
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
                  user: { select: { id: true } },
                },
              },
              property: { select: { name: true, zone: true } },
              serviceType: { select: { name: true } },
            },
          },
        },
      },
      staffTicket: true,
    },
  });

  if (!dispute) throw new Error('Dispute not found');

  const rawEvidence = dispute.evidence as EvidencePayload | null;
  const redactedEvidence = rawEvidence
    ? redactDisputeEvidence(rawEvidence)
    : null;

  return {
    ...dispute,
    evidence: redactedEvidence,
  };
}

/**
 * Staff resolves dispute. Records financial movement intent in audit log.
 * Actual ledger movement performed by payment service.
 */
export async function resolveDispute(
  disputeId: string,
  resolution: {
    action: 'FULL_REFUND' | 'FULL_RELEASE' | 'SPLIT_DECISION';
    amount?: number;
    notes: string;
  },
) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      task: {
        include: {
          assignment: {
            include: { serviceType: true },
          },
        },
      },
    },
  });

  if (!dispute) throw new Error('Dispute not found');

  const resolutionType: DisputeResolution =
    resolution.action === 'FULL_REFUND'
      ? 'PROVIDER_FAULT'
      : resolution.action === 'FULL_RELEASE'
      ? 'OWNER_FAULT'
      : 'SPLIT';

  await prisma.$transaction(async (tx) => {
    await tx.dispute.update({
      where: { id: disputeId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolution: resolution as unknown as object,
        resolutionType,
      },
    });

    if (dispute.staffTicketId) {
      await tx.staffTicket.update({
        where: { id: dispute.staffTicketId },
        data: {
          status: 'RESOLVED',
          resolution: resolution as unknown as object,
          resolvedAt: new Date(),
        },
      });
    }

    const assignment = dispute.task.assignment;
    if (!assignment) return;

    const totalAmount = new Decimal(assignment.totalAmount);

    switch (resolution.action) {
      case 'FULL_REFUND':
        await tx.financialAuditLog.create({
          data: {
            id: nanoid(),
            entityType: 'DISPUTE',
            entityId: disputeId,
            action: 'REFUND_ISSUED',
            payload: {
              assignmentId: assignment.id,
              amount: totalAmount.toString(),
              reason: 'Dispute resolution - full refund',
            },
          },
        });
        await tx.assignment.update({
          where: { id: assignment.id },
          data: {
            status: 'CANCELLED_BY_OWNER',
            disputeResolved: new Date(),
            resolution: resolutionType,
          },
        });
        break;

      case 'FULL_RELEASE':
        await tx.financialAuditLog.create({
          data: {
            id: nanoid(),
            entityType: 'DISPUTE',
            entityId: disputeId,
            action: 'PAYMENT_RELEASED',
            payload: {
              assignmentId: assignment.id,
              amount: totalAmount.toString(),
              reason: 'Dispute resolution - full release',
            },
          },
        });
        await tx.assignment.update({
          where: { id: assignment.id },
          data: {
            status: 'VERIFIED',
            verifiedAt: new Date(),
            disputeResolved: new Date(),
            resolution: resolutionType,
          },
        });
        break;

      case 'SPLIT_DECISION': {
        const providerAmount = new Decimal(resolution.amount ?? 0);
        const ownerAmount = totalAmount.minus(providerAmount);
        await tx.financialAuditLog.create({
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
        await tx.assignment.update({
          where: { id: assignment.id },
          data: {
            status: 'VERIFIED',
            verifiedAt: new Date(),
            disputeResolved: new Date(),
            resolution: resolutionType,
          },
        });
        break;
      }
    }
  });

  return { success: true };
}

export async function getOpenDisputes() {
  return prisma.dispute.findMany({
    where: {
      status: 'OPEN',
      expiresAt: { gt: new Date() },
    },
    include: {
      task: {
        include: {
          assignment: {
            include: {
              provider: { select: { businessName: true } },
              property: { select: { name: true, zone: true } },
              serviceType: { select: { name: true } },
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
 * Auto-expire OPEN disputes whose window has passed.
 * Caller is responsible for triggering payment finalization.
 */
export async function autoExpireDisputes(): Promise<number> {
  const expired = await prisma.dispute.findMany({
    where: { status: 'OPEN', expiresAt: { lt: new Date() } },
    select: { id: true },
  });

  for (const d of expired) {
    await prisma.dispute.update({
      where: { id: d.id },
      data: { status: 'EXPIRED', resolvedAt: new Date() },
    });
  }
  return expired.length;
}
