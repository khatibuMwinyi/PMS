import PgBoss from 'pg-boss';
import { assignmentExpirationWorker, financialReconciliationWorker } from './workers';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const boss = new PgBoss(process.env.DATABASE_URL);

boss.on('error', (error: unknown) => console.error('pg-boss error:', error));

export async function startWorker() {
  await boss.start();

  await boss.work(assignmentExpirationWorker.name, assignmentExpirationWorker.handler);
  await boss.work(financialReconciliationWorker.name, financialReconciliationWorker.handler);

  await boss.schedule(assignmentExpirationWorker.name, '* * * * *');
  await boss.schedule(financialReconciliationWorker.name, '0 0 * * *');

  console.log('OPSMP Job Worker Initialized');
}

export { boss };
