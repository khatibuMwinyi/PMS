// Financial Core: 80/20 payout saga implementation
import { prisma } from '@/core/database/client';
import { nanoid } from 'nanoid';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

/**
 * Process payment for a completed assignment, splitting 80% to the provider and 20% platform fee.
 * Implements the Saga pattern with a Serializable transaction. Any failure rolls back the DB changes.
 *
 * @param assignmentId - The ID of the assignment that has been completed.
 * @param totalAmount  - Total amount paid by the owner (decimal string or number).
 * @throws on validation or DB errors.
 */
export async function processServicePayment(
  assignmentId: string,
  totalAmount: string | number,
): Promise<void> {
  // Convert to Decimal for precise arithmetic
  const total = new Decimal(totalAmount);
  const platformFee = total.mul(0.20);
  const providerPayout = total.mul(0.80);

  await prisma.$transaction(async (tx) => {
    // ---- Verify assignment eligibility ----
    const assignment = await tx.assignment.findUnique({
      where: { id: assignmentId },
      select: { status: true, providerId: true },
    });
    if (!assignment) throw new Error('Assignment not found');
    // Only COMPLETED assignments are eligible for payout
    if (assignment.status !== 'COMPLETED') {
      throw new Error('Assignment not eligible for payout');
    }
    if (!assignment.providerId) throw new Error('Assignment has no provider');

    // ---- Ensure provider wallet exists ----
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
        },
      });
    }

    // ---- Credit pending balance ----
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { pendingBalance: { increment: providerPayout } },
    });

    // ---- Record immutable ledger entry ----
    await tx.walletTransaction.create({
      data: {
        id: nanoid(),
        walletId: wallet.id,
        type: 'CREDIT',
        amount: providerPayout,
        reference: assignmentId,
        status: 'PENDING',
      },
    });

    // ---- Audit log ----
    await tx.financialAuditLog.create({
      data: {
        id: nanoid(),
        entityType: 'ASSIGNMENT',
        entityId: assignmentId,
        action: 'PAYMENT_SPLIT',
        payload: {
          totalAmount: total.toString(),
          platformFee: platformFee.toString(),
          providerPayout: providerPayout.toString(),
        },
      },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  // If we reach here, the transaction succeeded. Further steps such as settlement
  // (moving from pending to available) are handled elsewhere.
}
