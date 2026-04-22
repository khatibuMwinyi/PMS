import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { Suspense } from 'react';
import ProviderTasksSkeleton from '@/components/dashboard/ProviderTasksSkeleton';
import { getProviderPendingAssignments } from '@/features/assignments/queries';

export const dynamic = 'force-dynamic';

export default function ProviderTasksPage() {
  return (
    <RoleGuard allowedRoles={['PROVIDER']}>
      <Suspense fallback={<ProviderTasksSkeleton />}>
        <ProviderTasksContent />
      </Suspense>
    </RoleGuard>
  );
}

async function ProviderTasksContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'PROVIDER') redirect('/login');

  const { assignments } = await getProviderPendingAssignments(1, 20);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-semibold text-[var(--text-primary)]">Tasks</h1>
        <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Your pending assignments</p>
      </div>
      {assignments.length === 0 ? (
        <p>No pending tasks.</p>
      ) : (
        <ul className="list-disc pl-5 space-y-2">
          {assignments.map((a) => (
            <li key={a.id}>Service: {a.serviceType.name} – expires {new Date(a.expiresAt).toLocaleString()}</li>
          ))}
        </ul>
      )}
    </div>
  );
}