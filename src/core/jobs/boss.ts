import PgBoss from 'pg-boss';
import {
  assignmentExpirationWorker,
  financialReconciliationWorker,
  priceLockCleanupWorker,
  settlementWorker,
  overdueTasksWorker,
  suspensionExpiryWorker,
  autoVerifyTasksWorker,
} from './workers';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set — pg-boss cannot start');
}

const boss = new PgBoss({
  connectionString: process.env.DATABASE_URL,
  deleteAfterDays: 7,
});

boss.on('error', (error: unknown) => {
  console.error('[pg-boss] Unhandled error:', error);
});

export async function startWorker(): Promise<void> {
  await boss.start();
  console.log('[pg-boss] Started');

  // Assignment expiration — every minute
  await boss.work(
    assignmentExpirationWorker.name,
    { teamSize: 5, teamConcurrency: 5 },
    assignmentExpirationWorker.handler,
  );
  await boss.schedule(
    assignmentExpirationWorker.name,
    '* * * * *',
    {},
    { singletonKey: 'assignment-expiration' },
  );

  // Financial reconciliation — daily 23:00 UTC
  await boss.work(
    financialReconciliationWorker.name,
    { teamSize: 1, teamConcurrency: 1 },
    financialReconciliationWorker.handler,
  );
  await boss.schedule(
    financialReconciliationWorker.name,
    '0 23 * * *',
    {},
    { singletonKey: 'financial-reconciliation' },
  );

  // Price-lock cleanup — hourly
  await boss.work(
    priceLockCleanupWorker.name,
    { teamSize: 1, teamConcurrency: 1 },
    priceLockCleanupWorker.handler,
  );
  await boss.schedule(
    priceLockCleanupWorker.name,
    '0 * * * *',
    {},
    { singletonKey: 'price-lock-cleanup' },
  );

  // 24h hold settlement — every 15 min
  await boss.work(
    settlementWorker.name,
    { teamSize: 1, teamConcurrency: 1 },
    settlementWorker.handler,
  );
  await boss.schedule(
    settlementWorker.name,
    '*/15 * * * *',
    {},
    { singletonKey: 'settlement' },
  );

  // Overdue task detection — every 30 min
  await boss.work(
    overdueTasksWorker.name,
    { teamSize: 1, teamConcurrency: 1 },
    overdueTasksWorker.handler,
  );
  await boss.schedule(
    overdueTasksWorker.name,
    '*/30 * * * *',
    {},
    { singletonKey: 'overdue-tasks' },
  );

  // Suspension expiry — hourly
  await boss.work(
    suspensionExpiryWorker.name,
    { teamSize: 1, teamConcurrency: 1 },
    suspensionExpiryWorker.handler,
  );
  await boss.schedule(
    suspensionExpiryWorker.name,
    '0 * * * *',
    {},
    { singletonKey: 'suspension-expiry' },
  );

  // Auto-verify tasks — every 30 min
  await boss.work(
    autoVerifyTasksWorker.name,
    { teamSize: 1, teamConcurrency: 1 },
    autoVerifyTasksWorker.handler,
  );
  await boss.schedule(
    autoVerifyTasksWorker.name,
    '*/30 * * * *',
    {},
    { singletonKey: 'auto-verify-tasks' },
  );

  console.log(
    '[pg-boss] Workers registered: assignment-expiration, financial-reconciliation, price-lock-cleanup, settlement, overdue-tasks, suspension-expiry, auto-verify-tasks',
  );
}

export { boss };
