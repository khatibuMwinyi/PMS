import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { prisma } from '@/core/database/client';
import { formatTZS } from '@/shared/lib/currency';

export const dynamic = 'force-dynamic';

export default function ProviderTasksPage() {
  return (
    <RoleGuard allowedRoles={['PROVIDER']}>
      <DashboardHeader title="Tasks" subtitle="Scheduled and in-progress task instances." />
      <Suspense fallback={<div className="text-body-sm text-[var(--text-muted)]">Loading…</div>}>
        <TasksContent />
      </Suspense>
    </RoleGuard>
  );
}

async function TasksContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'PROVIDER') redirect('/login');

  const provider = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!provider) return null;

  const tasks = await prisma.task.findMany({
    where: {
      assignment: { providerId: provider.id },
      status: { in: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'] },
    },
    orderBy: { scheduledFor: 'asc' },
    take: 50,
    select: {
      id: true,
      scheduledFor: true,
      status: true,
      assignment: {
        select: {
          id: true,
          providerPayout: true,
          serviceType: { select: { name: true } },
          property: { select: { zone: true } },
        },
      },
    },
  });

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 text-center text-body-sm text-[var(--text-muted)]">
        No tasks yet. Accept a job offer to begin.
      </div>
    );
  }

  return (
    <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--surface-card)] overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-[var(--surface-page)] border-b border-[var(--border-subtle)]">
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Task</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Service</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Zone</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Scheduled</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2 text-right">Payout</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="text-body-sm text-[var(--text-primary)] tabular-nums">
          {tasks.map((t, i) => (
            <tr
              key={t.id}
              className={`border-b border-[var(--border-subtle)] ${i % 2 === 1 ? 'bg-[var(--surface-page)]' : ''}`}
            >
              <td className="px-3 py-2 text-[var(--text-secondary)]">
                <Link href={`/provider/tasks/${t.id}`} className="hover:underline">
                  #{t.id.slice(0, 6).toUpperCase()}
                </Link>
              </td>
              <td className="px-3 py-2 font-medium">{t.assignment.serviceType.name}</td>
              <td className="px-3 py-2 text-[var(--text-secondary)]">{t.assignment.property.zone}</td>
              <td className="px-3 py-2">
                {t.scheduledFor.toLocaleString('en-GB', {
                  weekday: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-3 py-2 text-right">
                {formatTZS(t.assignment.providerPayout.toString())}
              </td>
              <td className="px-3 py-2 text-right">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-label bg-[var(--surface-overlay)] text-[var(--text-secondary)]">
                  {t.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
