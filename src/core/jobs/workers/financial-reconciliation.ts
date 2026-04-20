import { Decimal } from '@prisma/client/runtime/library';
import { nanoid }   from 'nanoid';
import { prisma }   from '@/core/database/client';

/**
 * Nightly Financial Reconciliation Job
 * Scheduled: 02:00 EAT (23:00 UTC) via pg-boss
 *
 * Algorithm:
 *   For every wallet:
 *     1. SUM all WalletTransaction.amount WHERE status = 'SETTLED'
 *        This is the ground truth from the immutable ledger.
 *     2. Compare against wallet.availableBalance.
 *     3. If they diverge → INSERT a ReconciliationAlert.
 *        NEVER auto-correct. Let ops investigate and resolve manually.
 *
 * Why SETTLED only?
 *   PENDING transactions have not yet moved to availableBalance —
 *   they are in pendingBalance. Including them in the settled ledger
 *   sum would produce a false positive on every wallet with pending earnings.
 *
 * Why no auto-fix?
 *   An automated correction could mask a double-credit or a missing debit.
 *   The alert exists so a human confirms what happened before touching balances.
 */
export const financialReconciliationWorker = {
  name: 'financial-reconciliation',

  handler: async (): Promise<void> => {
    const startedAt = new Date();
    console.log(`[RECONCILIATION] Job started at ${startedAt.toISOString()}`);

    const wallets = await prisma.wallet.findMany({
      select: {
        id:               true,
        providerId:       true,
        availableBalance: true,
      },
    });

    let checked    = 0;
    let alertsFiled = 0;

    for (const wallet of wallets) {
      checked++;

      // ── Sum settled ledger entries for this wallet ─────────────────
      const result = await prisma.walletTransaction.aggregate({
        where:  {
          walletId: wallet.id,
          status:   'SETTLED',
        },
        _sum:   { amount: true },
      });

      // No settled transactions yet — wallet balance should be 0
      const ledgerSum: Decimal = result._sum.amount ?? new Decimal(0);
      const actual:    Decimal = wallet.availableBalance;

      // ── Compare with a tolerance of zero ──────────────────────────
      // Financial systems require exact decimal equality.
      if (!ledgerSum.equals(actual)) {
        const delta = actual.minus(ledgerSum).abs();

        console.error(
          `[RECONCILIATION] ⚠ Divergence on wallet ${wallet.id}: ` +
          `ledger=${ledgerSum.toString()} actual=${actual.toString()} delta=${delta.toString()}`
        );

        // ── File alert — do NOT modify balances ────────────────────
        await prisma.reconciliationAlert.create({
          data: {
            id:            nanoid(),
            walletId:      wallet.id,
            ledgerSum,
            actualBalance: actual,
            delta,
          },
        });

        alertsFiled++;
      }
    }

    // ── Write reconciliation audit log ───────────────────────────────
    await prisma.financialAuditLog.create({
      data: {
        id:         nanoid(),
        entityType: 'SYSTEM',
        entityId:   'RECONCILIATION_JOB',
        action:     'NIGHTLY_RECONCILIATION_COMPLETE',
        payload:    {
          startedAt:    startedAt.toISOString(),
          completedAt:  new Date().toISOString(),
          walletsChecked: checked,
          alertsFiled,
        },
      },
    });

    console.log(
      `[RECONCILIATION] Complete. Checked: ${checked} wallets. Alerts filed: ${alertsFiled}.`
    );
  },
};