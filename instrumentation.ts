export const runtime = 'nodejs';

export async function register() {
  // Only run in Node.js runtime, skip Edge
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startWorker } = await import('./src/core/jobs/boss');
    await startWorker();
  }
}