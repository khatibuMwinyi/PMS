import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';

export default async function AdminOwnersPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/login');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-semibold text-[var(--text-primary)]">Owners</h1>
        <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Manage property owners and accounts
        </p>
      </div>
      <div
        className="flex items-center justify-center min-h-[320px] rounded-[var(--radius-xl)] border border-dashed text-[14px]"
        style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
      >
        Owner management — coming in Phase 2
      </div>
    </div>
  );
}