export const runtime = 'nodejs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (process.env.VERCEL) {
      return;
    }
    const { startWorker } = await import('./src/core/jobs/boss');
    await startWorker();
  }
}