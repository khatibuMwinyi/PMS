import PgBoss from 'pg-boss';
import { assignmentExpirationWorker, financialReconciliationWorker } from './workers';
import { priceLockCleanupWorker } from './workers/price-lock-cleanup';
import { autoVerifyPendingTasks } from '@/features/tasks/actions';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set — pg-boss cannot start');
}

const boss = new PgBoss({
  connectionString: process.env.DATABASE_URL,
  // Retain completed job records for 7 days for audit purposes
  deleteAfterDays: 7,
});

boss.on('error', (error: unknown) => {
  console.error('[pg-boss] Unhandled error:', error);
});

export async function startWorker(): Promise<void> {
  await boss.start();
  console.log('[pg-boss] Started');

  // ── Worker 1: Assignment expiration ───────────────────────────────
  // Polls every minute for assignments past their expiresAt timestamp
  await boss.work(
    assignmentExpirationWorker.name,
    { teamSize: 5, teamConcurrency: 5 },
    assignmentExpirationWorker.handler,
  );
  await boss.schedule(
    assignmentExpirationWorker.name,
    '* * * * *',          // Every minute
    {},
    { singletonKey: 'assignment-expiration' },
  );

  // ── Worker 2: Nightly financial reconciliation ─────────────────────
  // Runs at 23:00 UTC (02:00 EAT) — after the day's transactions settle
  await boss.work(
    financialReconciliationWorker.name,
    { teamSize: 1, teamConcurrency: 1 },   // Must run serially
    financialReconciliationWorker.handler,
  );
  await boss.schedule(
    financialReconciliationWorker.name,
    '0 23 * * *',         // 23:00 UTC daily
    {},
    { singletonKey: 'financial-reconciliation' },
  );

  // ── Worker 3: Price‑lock cleanup ────────────────────────────────────────
// Runs hourly to remove expired locks
await boss.work(
  priceLockCleanupWorker.name,
  { teamSize: 1, teamConcurrency: 1 },
  priceLockCleanupWorker.handler,
);
await boss.schedule(
  priceLockCleanupWorker.name,
  '0 * * * *', // every hour at minute 0
  {},
  { singletonKey: 'price-lock-cleanup' },
);

console.log('[pg-boss] Workers registered: assignment-expiration, financial-reconciliation, price-lock-cleanup');
}

export { boss };