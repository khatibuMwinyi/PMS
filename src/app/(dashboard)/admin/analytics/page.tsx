import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/login');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h2 font-semibold text-[var(--text-primary)]">Analytics</h1>
        <p className="text-body-sm mt-0.5 text-[var(--text-secondary)]">
          Platform-wide analytics and reporting
        </p>
      </div>
      <div
        className="flex items-center justify-center min-h-[320px] rounded-[var(--radius-xl)] border border-dashed text-body-sm"
        style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
      >
        Analytics dashboard — coming in Phase 2
      </div>
    </div>
  );
}