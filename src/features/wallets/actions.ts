"use server";

import { prisma } from '@/core/database/client';
import { Decimal, Prisma } from '@prisma/client';

export async function processServicePayment(
  assignmentId: string,
  totalAmount: number
): Promise<{ success: boolean; error?: string }> {
  const platformFee = new Decimal(totalAmount).mul(0.20);
  const providerPayout = new Decimal(totalAmount).mul(0.80);

  try {
    return await prisma.$transaction(async (tx) => {
      // Step 3: Debit/Verify owner payment status (Assume funds escrowed)
      const assignment = await tx.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          provider: {
            include: { wallet: true },
          }
        },
      });

      if (!assignment || !assignment.provider) {
        throw new Error('Assignment or provider context missing');
      }

      // Ensure wallet exists for the provider
      let wallet = assignment.provider.wallet;
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { providerId: assignment.providerId! }
        });
      }

      // Step 4: Credit provider's pendingBalance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { pendingBalance: { increment: providerPayout } }
      });

      // Step 5: Create WalletTransaction (CREDIT, PENDING)
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          amount: providerPayout,
          reference: assignmentId,
          status: 'PENDING',
        },
      });

      // Step 6: Create FinancialAuditLog entry
      await tx.financialAuditLog.create({
        data: {
          entityType: 'ASSIGNMENT',
          entityId: assignmentId,
          action: 'PAYMENT_SPLIT',
          payload: {
            totalAmount,
            providerPayout: providerPayout.toString(),
            platformFee: platformFee.toString(),
          },
        },
      });

      return { success: true };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });
  } catch (error) {
    console.error('Split payment saga failed:', error);
    return { success: false, error: 'Financial processing failed' };
  }
}
