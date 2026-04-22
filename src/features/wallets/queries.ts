'use server';

import { prisma }           from '@/core/database/client';
import { auth }             from '@/core/auth';
import type { WalletSummary } from './types';

/**
 * Load the wallet summary for the logged-in provider.
 * Returns null if no wallet exists yet (provider has not received any payment).
 */
export async function getProviderWallet(): Promise<WalletSummary | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'PROVIDER') {
    throw new Error('Unauthorized');
  }

  const provider = await prisma.providerProfile.findUnique({
    where:   { userId: session.user.id },
    select:  { id: true },
  });

  if (!provider) return null;

  const wallet = await prisma.wallet.findUnique({
    where:   { providerId: provider.id },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take:    50,    // Last 50 transactions for the dashboard
      },
    },
  });

  if (!wallet) return null;

  return {
    id:               wallet.id,
    availableBalance: wallet.availableBalance.toNumber(),
    pendingBalance:   wallet.pendingBalance.toNumber(),
    lastUpdated:      wallet.updatedAt,
    transactions: wallet.transactions.map((t) => ({
      id:        t.id,
      type:      t.type,
      amount:    t.amount.toNumber(),
      reference: t.reference,
      status:    t.status,
      createdAt: t.createdAt.toISOString(),
    })),
  };
}

/**
 * Admin: get all wallets with balances for the reconciliation dashboard.
 */
export async function getAllWallets() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'STAFF'].includes(session.user.role)) {
    throw new Error('Unauthorized');
  }

  return prisma.wallet.findMany({
    include: {
      provider:  { select: { businessName: true, userId: true } },
      alerts:    { where: { resolvedAt: null }, select: { id: true } },
    },
    orderBy: { availableBalance: 'desc' },
  });
}

/**
 * Admin: get unresolved reconciliation alerts.
 */
export async function getReconciliationAlerts() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'STAFF'].includes(session.user.role)) {
    throw new Error('Unauthorized');
  }

  return prisma.reconciliationAlert.findMany({
    where:   { resolvedAt: null },
    include: {
      wallet: {
        include: { provider: { select: { businessName: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}