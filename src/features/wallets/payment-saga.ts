'use server';

import { prisma } from '@/core/database/client';
import { mockPaymentProcessor } from '@/integrations/mock-payment/client';
import { nanoid } from 'nanoid';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Payment Saga for 80/20 split
 * Handles the complete payment flow with rollback capability
 */
export interface PaymentSagaData {
  assignmentId: string;
  totalAmount: number;
  ownerId: string;
  providerId: string;
}

/**
 * Saga step result
 */
interface SagaStep {
  success: boolean;
  data?: any;
  error?: string;
  compensation?: () => Promise<void>;
}

/**
 * Execute payment saga
 */
export async function executePaymentSaga(data: PaymentSagaData): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
}> {
  const sagaId = nanoid();
  console.log(`[PAYMENT SAGA] Starting saga ${sagaId} for assignment ${data.assignmentId}`);

  try {
    // Step 1: Debit owner (mock)
    const debitStep = await debitOwner(data);
    if (!debitStep.success) {
      throw new Error(`Owner debit failed: ${debitStep.error}`);
    }

    // Step 2: Credit provider (mock)
    const creditStep = await creditProvider(data);
    if (!creditStep.success) {
      // Compensation: Refund owner
      await debitStep.compensation?.();
      throw new Error(`Provider credit failed: ${creditStep.error}`);
    }

    // Step 3: Record financial audit
    await recordFinancialAudit(data, sagaId, 'SUCCESS');

    console.log(`[PAYMENT SAGA] Completed successfully ${sagaId}`);
    return {
      success: true,
      transactionId: creditStep.data?.transactionId,
    };

  } catch (error) {
    console.error(`[PAYMENT SAGA] Failed ${sagaId}:`, error);

    // Record failure in audit log
    await recordFinancialAudit(data, sagaId, 'FAILED', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}

/**
 * Step 1: Debit owner account
 */
async function debitOwner(data: PaymentSagaData): Promise<SagaStep> {
  console.log(`[PAYMENT SAGA] Debiting owner ${data.ownerId} for ${data.totalAmount}`);

  try {
    // In a real system, this would be Selcom API call
    const result = await mockPaymentProcessor.processPayment({
      invoiceId: `INV-${data.assignmentId}`,
      amount: data.totalAmount,
      description: `Service payment for assignment ${data.assignmentId}`,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.message,
        compensation: async () => {
          // No compensation needed for mock debit
        },
      };
    }

    // Record owner debit
    await prisma.walletTransaction.create({
      data: {
        id: nanoid(),
        walletId: data.ownerId, // In real system, owner would have wallet
        type: 'DEBIT',
        amount: new Decimal(data.totalAmount),
        reference: data.assignmentId,
        status: 'SETTLED',
      },
    });

    return {
      success: true,
      data: result,
      compensation: async () => {
        console.log(`[PAYMENT SAGA] Compensating owner debit for ${data.assignmentId}`);
        // In real system, this would be a refund
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Debit failed',
      compensation: async () => {
        console.log(`[PAYMENT SAGA] Compensation triggered for owner debit`);
      },
    };
  }
}

/**
 * Step 2: Credit provider wallet
 */
async function creditProvider(data: PaymentSagaData): Promise<SagaStep> {
  const providerAmount = data.totalAmount * 0.8; // 80% to provider

  console.log(`[PAYMENT SAGA] Crediting provider ${data.providerId} with ${providerAmount}`);

  try {
    // Get provider wallet
    const wallet = await prisma.wallet.findUnique({
      where: { providerId: data.providerId },
    });

    if (!wallet) {
      throw new Error('Provider wallet not found');
    }

    // Mock disbursement
    const result = await mockPaymentProcessor.processWithdrawal({
      walletId: wallet.id,
      amount: providerAmount,
      reference: data.assignmentId,
      providerPhone: '255123456789', // Mock phone
    });

    if (!result.success) {
      return {
        success: false,
        error: result.message,
        compensation: async () => {
          // Owner already debited - need refund
        },
      };
    }

    // Credit provider wallet
    await prisma.walletTransaction.create({
      data: {
        id: nanoid(),
        walletId: wallet.id,
        type: 'CREDIT',
        amount: new Decimal(providerAmount),
        reference: data.assignmentId,
        status: 'PENDING', // PENDING until Selcom confirms
      },
    });

    // Update wallet balances
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        pendingBalance: wallet.pendingBalance.plus(new Decimal(providerAmount)),
      },
    });

    return {
      success: true,
      data: result,
      compensation: async () => {
        console.log(`[PAYMENT SAGA] Compensating provider credit for ${data.assignmentId}`);
        // This would be a withdrawal reversal
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Credit failed',
      compensation: async () => {
        console.log(`[PAYMENT SAGA] Compensation triggered for provider credit`);
      },
    };
  }
}

/**
 * Step 3: Record financial audit
 */
async function recordFinancialAudit(
  data: PaymentSagaData,
  sagaId: string,
  status: 'SUCCESS' | 'FAILED',
  errorData?: any
) {
  await prisma.financialAuditLog.create({
    data: {
      id: nanoid(),
      entityType: 'ASSIGNMENT',
      entityId: data.assignmentId,
      action: status === 'SUCCESS' ? 'PAYMENT_SPLIT' : 'SAGA_FAILED',
      payload: {
        sagaId,
        totalAmount: data.totalAmount,
        providerAmount: data.totalAmount * 0.8,
        platformAmount: data.totalAmount * 0.2,
        status,
        error: errorData,
      },
    },
  });
}

/**
 * Process service payment (entry point)
 */
export async function processServicePayment(
  assignmentId: string,
  amount: number
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  // Get assignment details
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      property: {
        include: {
          owner: true,
        },
      },
      provider: true,
    },
  });

  if (!assignment) {
    return {
      success: false,
      error: 'Assignment not found',
    };
  }

  const sagaData: PaymentSagaData = {
    assignmentId,
    totalAmount: amount,
    ownerId: assignment.property.owner.userId,
    providerId: assignment.providerId!,
  };

  return await executePaymentSaga(sagaData);
}

/**
 * Settle pending payments (called when Selcom webhook confirms)
 */
export async function settlePendingPayments(): Promise<{ settled: number; failed: number }> {
  const pendingTransactions = await prisma.walletTransaction.findMany({
    where: {
      type: 'CREDIT',
      status: 'PENDING',
    },
    include: {
      wallet: true,
    },
  });

  let settled = 0;
  let failed = 0;

  for (const transaction of pendingTransactions) {
    try {
      // In real system, verify with Selcom webhook
      // For mock, just mark as settled
      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: { status: 'SETTLED' },
      });

      // Move from pending to available balance
      await prisma.wallet.update({
        where: { id: transaction.walletId },
        data: {
          availableBalance: transaction.wallet.availableBalance.plus(transaction.amount),
          pendingBalance: transaction.wallet.pendingBalance.minus(transaction.amount),
        },
      });

      settled++;
    } catch (error) {
      console.error('Failed to settle transaction:', transaction.id, error);
      failed++;
    }
  }

  return { settled, failed };
}