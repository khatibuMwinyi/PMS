'use server';

// Financial Core: Atomic 80/20 payment saga.
//
// Triggered by Selcom webhook (SUCCESS) — pays Owner→Oweru→Provider.
//
// Steps (single Serializable transaction):
//   1. Mark Invoice PAID.
//   2. Credit Provider wallet pendingBalance (80%) + ledger EARNING row.
//   3. Record platform 20% to PlatformRevenue.
//   4. Activate Agreement (PENDING_ASSIGNMENT → ACTIVE) + Assignment (ACCEPTED → SCHEDULED).
//   5. Audit log.

import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { nanoid } from 'nanoid';
import { prisma } from '@/core/database/client';

/**
 * Process a successful invoice payment.
 * @param invoiceId Invoice that was paid (referenced by Selcom order_id)
 * @param amount    Total paid in TZS
 * @param paymentRef Selcom transaction reference
 */
export async function processInvoicePayment(
  invoiceId: string,
  amount: string | number,
  paymentRef: string,
): Promise<void> {
  const total = new Decimal(amount);
  const providerShare = total.mul(0.8);
  const platformShare = total.mul(0.2);

  await prisma.$transaction(
    async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          agreement: {
            include: { assignment: { include: { provider: true } } },
          },
        },
      });
      if (!invoice) throw new Error('Invoice not found');
      if (invoice.status === 'PAID') return;
      if (invoice.status === 'CANCELLED') throw new Error('Invoice cancelled');

      const assignment = invoice.agreement.assignment;
      if (!assignment) throw new Error('Agreement has no assignment');
      if (!assignment.providerId) throw new Error('Assignment has no provider');

      // 1. Invoice → PAID
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentRef,
        },
      });

      // 2. Provider wallet credit (pending — 24h hold)
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

      const newPending = wallet.pendingBalance.add(providerShare);
      const newTotalEarned = wallet.totalEarned.add(providerShare);

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
          type: 'EARNING',
          amount: providerShare,
          reference: assignment.id,
          status: 'PENDING',
          runningBalance: wallet.availableBalance.add(newPending),
        },
      });

      // 3. Platform 20% revenue
      await tx.platformRevenue.create({
        data: {
          id: nanoid(),
          assignmentId: assignment.id,
          amount: platformShare,
          reference: paymentRef,
        },
      });

      // 4. Activate Agreement + Assignment
      await tx.agreement.update({
        where: { id: invoice.agreementId },
        data: { status: 'ACTIVE' },
      });

      await tx.assignment.update({
        where: { id: assignment.id },
        data: {
          status: assignment.status === 'ACCEPTED' ? 'SCHEDULED' : assignment.status,
        },
      });

      // Ensure at least one Task exists (first execution).
      const existingTask = await tx.task.findFirst({
        where: { assignmentId: assignment.id },
      });
      if (!existingTask && assignment.scheduledDate) {
        await tx.task.create({
          data: {
            id: nanoid(),
            assignmentId: assignment.id,
            scheduledFor: assignment.scheduledDate,
            status: 'SCHEDULED',
          },
        });
      }

      // 5. Audit log
      await tx.financialAuditLog.create({
        data: {
          id: nanoid(),
          entityType: 'INVOICE',
          entityId: invoiceId,
          action: 'PAYMENT_SPLIT',
          payload: {
            invoiceId,
            assignmentId: assignment.id,
            providerId: assignment.providerId,
            totalAmount: total.toString(),
            providerPayout: providerShare.toString(),
            platformFee: platformShare.toString(),
            paymentRef,
          },
        },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

/**
 * Handle a FAILED payment attempt: increment retry counter, possibly suspend.
 * Spec §XV: 3 fails → service suspended; 7 days unpaid → contract terminated.
 */
export async function handleInvoicePaymentFailure(
  invoiceId: string,
  paymentRef: string,
  reason: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      select: { id: true, attempts: true, status: true, agreementId: true },
    });
    if (!invoice) throw new Error('Invoice not found');
    if (invoice.status === 'PAID') return;

    const attempts = invoice.attempts + 1;
    const shouldSuspend = attempts >= 3;

    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        attempts,
        status: shouldSuspend ? 'FAILED' : 'PENDING',
        suspendedAt: shouldSuspend ? new Date() : undefined,
      },
    });

    if (shouldSuspend) {
      await tx.agreement.update({
        where: { id: invoice.agreementId },
        data: { status: 'SUSPENDED' },
      });
    }

    await tx.financialAuditLog.create({
      data: {
        id: nanoid(),
        entityType: 'INVOICE',
        entityId: invoiceId,
        action: shouldSuspend ? 'PAYMENT_SUSPENDED' : 'PAYMENT_FAILED',
        payload: { attempts, paymentRef, reason },
      },
    });
  });
}

/**
 * Settlement job — moves PENDING earnings older than 24h to availableBalance.
 * Spec §VI.1: providers can withdraw after 24h hold.
 */
export async function settlePendingEarnings(): Promise<{ settled: number }> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const candidates = await prisma.walletTransaction.findMany({
    where: {
      type: 'EARNING',
      status: 'PENDING',
      createdAt: { lte: cutoff },
    },
    include: { wallet: true },
  });

  let settled = 0;

  for (const txn of candidates) {
    await prisma.$transaction(
      async (db) => {
        const wallet = await db.wallet.findUnique({
          where: { id: txn.walletId },
        });
        if (!wallet) return;

        const newAvailable = wallet.availableBalance.add(txn.amount);
        const newPending = wallet.pendingBalance.sub(txn.amount);

        await db.wallet.update({
          where: { id: wallet.id },
          data: {
            availableBalance: newAvailable,
            pendingBalance: newPending,
            version: { increment: 1 },
          },
        });

        await db.walletTransaction.update({
          where: { id: txn.id },
          data: {
            status: 'SETTLED',
            runningBalance: newAvailable,
          },
        });

        await db.assignment.updateMany({
          where: {
            id: txn.reference,
            status: { in: ['COMPLETED', 'VERIFIED'] },
          },
          data: { status: 'VERIFIED', verifiedAt: new Date() },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    settled++;
  }

  return { settled };
}

/**
 * Provider withdrawal request — min 50,000 TZS, no disputed funds.
 */
const MIN_WITHDRAWAL_TZS = 50000;

export async function requestWithdrawal(
  walletId: string,
  amount: number | string,
  mobileNumber: string,
): Promise<{ withdrawalId: string }> {
  const amt = new Decimal(amount);
  if (amt.lt(MIN_WITHDRAWAL_TZS)) {
    throw new Error(`Minimum withdrawal is TZS ${MIN_WITHDRAWAL_TZS.toLocaleString()}`);
  }

  return prisma.$transaction(
    async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
      });
      if (!wallet) throw new Error('Wallet not found');
      if (wallet.availableBalance.lt(amt)) {
        throw new Error('Insufficient available balance');
      }

      const withdrawal = await tx.withdrawal.create({
        data: {
          id: nanoid(),
          walletId,
          amount: amt,
          mobileNumber,
          status: 'PENDING',
        },
      });

      await tx.wallet.update({
        where: { id: walletId },
        data: {
          availableBalance: wallet.availableBalance.sub(amt),
          version: { increment: 1 },
        },
      });

      await tx.walletTransaction.create({
        data: {
          id: nanoid(),
          walletId,
          type: 'WITHDRAWAL',
          amount: amt.neg(),
          reference: withdrawal.id,
          status: 'PENDING',
          runningBalance: wallet.availableBalance.sub(amt).add(wallet.pendingBalance),
        },
      });

      await tx.financialAuditLog.create({
        data: {
          id: nanoid(),
          entityType: 'WITHDRAWAL',
          entityId: withdrawal.id,
          action: 'WITHDRAWAL_REQUESTED',
          payload: {
            walletId,
            amount: amt.toString(),
            mobileNumber: mobileNumber.replace(/.(?=.{4})/g, '*'),
          },
        },
      });

      return { withdrawalId: withdrawal.id };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

// ─── Backward-compatible legacy exports ─────────────────────────────

/**
 * @deprecated Old signature kept for callers passing assignmentId.
 * Will route to processInvoicePayment via invoice lookup.
 */
export async function processServicePayment(
  assignmentOrInvoiceId: string,
  totalAmount: string | number,
): Promise<void> {
  // Try as invoiceId first
  const invoice = await prisma.invoice.findUnique({
    where: { id: assignmentOrInvoiceId },
    select: { id: true },
  });

  if (invoice) {
    await processInvoicePayment(invoice.id, totalAmount, `legacy-${nanoid()}`);
    return;
  }

  // Fallback: look up invoice by assignment → agreement
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentOrInvoiceId },
    select: { agreementId: true },
  });
  if (!assignment) throw new Error('Assignment/invoice not found');

  const inv = await prisma.invoice.findUnique({
    where: { agreementId: assignment.agreementId },
    select: { id: true },
  });
  if (!inv) throw new Error('Invoice for assignment not found');

  await processInvoicePayment(inv.id, totalAmount, `legacy-${nanoid()}`);
}
