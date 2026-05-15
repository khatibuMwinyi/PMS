'use server';

// Cancellation penalty per Spec §VIII + §XI:
//   • Before provider acceptance:   0% penalty.
//   • After provider acceptance:   20% penalty
//      - 15% credited to provider wallet as compensation
//      -  5% retained by Oweru platform
//   • After payment:                20% penalty, 80% refunded
//   • During execution:             Cannot be cancelled — only dispute applies.

import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { nanoid } from 'nanoid';
import { prisma } from '@/core/database/client';

export interface CancelResult {
  refundAmount: string;
  providerCompensation: string;
  platformFee: string;
  newStatus: string;
}

export async function cancelAgreement(
  agreementId: string,
  actorId: string,
): Promise<CancelResult> {
  return prisma.$transaction(
    async (tx) => {
      const agreement = await tx.agreement.findUnique({
        where: { id: agreementId },
        include: {
          assignment: { include: { tasks: true } },
          invoice: true,
        },
      });
      if (!agreement) throw new Error('Agreement not found');

      const assignment = agreement.assignment;

      // Cannot cancel after check-in
      const inExecution = assignment?.tasks.some((t) =>
        ['IN_PROGRESS', 'COMPLETED', 'VERIFIED'].includes(t.status),
      );
      if (inExecution) {
        throw new Error('Cannot cancel after task started — use dispute flow');
      }

      const total = new Decimal(agreement.quotedPrice);

      // Case A: pre-acceptance → no penalty
      if (!assignment || assignment.status === 'PENDING_ACCEPTANCE') {
        await tx.agreement.update({
          where: { id: agreementId },
          data: { status: 'CANCELLED' },
        });
        if (assignment) {
          await tx.assignment.update({
            where: { id: assignment.id },
            data: {
              status: 'CANCELLED_BY_OWNER',
              cancelledAt: new Date(),
              cancelReason: 'Owner cancellation pre-acceptance',
            },
          });
        }
        if (agreement.invoice && agreement.invoice.status !== 'PAID') {
          await tx.invoice.update({
            where: { id: agreement.invoice.id },
            data: { status: 'CANCELLED', cancelledAt: new Date() },
          });
        }
        await tx.financialAuditLog.create({
          data: {
            id: nanoid(),
            entityType: 'AGREEMENT',
            entityId: agreementId,
            action: 'CANCELLED_NO_PENALTY',
            payload: { actorId, total: total.toString() },
          },
        });
        return {
          refundAmount: '0',
          providerCompensation: '0',
          platformFee: '0',
          newStatus: 'CANCELLED',
        };
      }

      // Case B / C: post-acceptance → 20% penalty
      const penalty = total.times(0.2);
      const providerCompensation = total.times(0.15);
      const platformFee = total.times(0.05);
      const refundAmount = total.times(0.8);

      const invoicePaid = agreement.invoice?.status === 'PAID';

      // Mark agreement + assignment cancelled
      await tx.agreement.update({
        where: { id: agreementId },
        data: { status: 'CANCELLED' },
      });
      await tx.assignment.update({
        where: { id: assignment.id },
        data: {
          status: 'CANCELLED_BY_OWNER',
          cancelledAt: new Date(),
          cancelReason: `Owner cancellation post-acceptance (penalty TZS ${penalty.toString()})`,
        },
      });

      // Credit provider 15% compensation
      if (assignment.providerId) {
        let wallet = await tx.wallet.findUnique({
          where: { providerId: assignment.providerId },
        });
        if (!wallet) {
          wallet = await tx.wallet.create({
            data: {
              id: nanoid(),
              providerId: assignment.providerId,
              availableBalance: new Decimal(0),
              pendingBalance: new Decimal(0),
              totalEarned: new Decimal(0),
            },
          });
        }
        const newPending = wallet.pendingBalance.add(providerCompensation);
        const newTotalEarned = wallet.totalEarned.add(providerCompensation);
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            pendingBalance: newPending,
            totalEarned: newTotalEarned,
            version: { increment: 1 },
          },
        });
        await tx.walletTransaction.create({
          data: {
            id: nanoid(),
            walletId: wallet.id,
            type: 'COMPENSATION',
            amount: providerCompensation,
            reference: assignment.id,
            status: 'PENDING',
            runningBalance: wallet.availableBalance.add(newPending),
          },
        });
      }

      // Record platform fee
      await tx.platformRevenue.create({
        data: {
          id: nanoid(),
          assignmentId: assignment.id,
          amount: platformFee,
          reference: `cancel-${agreementId}`,
        },
      });

      // Invoice handling
      if (agreement.invoice) {
        if (invoicePaid) {
          // Refund 80% to owner — record intent only; actual mobile-money
          // refund handled by ops via withdrawal/refund queue.
          await tx.financialAuditLog.create({
            data: {
              id: nanoid(),
              entityType: 'INVOICE',
              entityId: agreement.invoice.id,
              action: 'REFUND_REQUIRED',
              payload: {
                refundAmount: refundAmount.toString(),
                reason: 'Owner cancellation post-payment',
              },
            },
          });
        } else {
          await tx.invoice.update({
            where: { id: agreement.invoice.id },
            data: { status: 'CANCELLED', cancelledAt: new Date() },
          });
        }
      }

      await tx.financialAuditLog.create({
        data: {
          id: nanoid(),
          entityType: 'AGREEMENT',
          entityId: agreementId,
          action: 'CANCELLED_WITH_PENALTY',
          payload: {
            actorId,
            total: total.toString(),
            penalty: penalty.toString(),
            providerCompensation: providerCompensation.toString(),
            platformFee: platformFee.toString(),
            refundAmount: refundAmount.toString(),
            invoicePaid,
          },
        },
      });

      return {
        refundAmount: refundAmount.toString(),
        providerCompensation: providerCompensation.toString(),
        platformFee: platformFee.toString(),
        newStatus: 'CANCELLED',
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
