import { prisma } from '@/core/database/client';
import { Decimal } from '@prisma/client';

export const financialReconciliationWorker = {
  name: 'financial-reconciliation',
  handler: async () => {
    const wallets = await prisma.wallet.findMany();

    for (const wallet of wallets) {
      // SUM the amounts in WalletTransaction where status is SETTLED
      const result = await prisma.walletTransaction.aggregate({
        where: {
          walletId: wallet.id,
          status: 'SETTLED'
        },
        _sum: { amount: true }
      });

      const ledgerSum = result._sum.amount || new Decimal(0);

      // Compare against availableBalance
      if (!wallet.availableBalance.equals(ledgerSum)) {
        await prisma.reconciliationAlert.create({
          data: {
            walletId: wallet.id,
            ledgerSum,
            actualBalance: wallet.availableBalance
          }
        });
      }
    }
  }
};