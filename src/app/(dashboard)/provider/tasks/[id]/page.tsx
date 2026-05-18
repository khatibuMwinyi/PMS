import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { getProviderTaskDetail } from '@/features/tasks/queries';
import { AssignmentStepTracker } from '@/features/assignments/components/AssignmentStepTracker';
import { GpsCheckInCard } from '@/features/tasks/components/GpsCheckInCard';
import { ProofOfWorkUpload } from '@/features/tasks/components/ProofOfWorkUpload';
import { formatTZS } from '@/shared/lib/currency';
import type { AssignmentStatus } from '@/features/assignments/types';

export const dynamic = 'force-dynamic';

export default async function ProviderTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RoleGuard allowedRoles={['PROVIDER']}>
      <Suspense
        fallback={
          <div className="text-body-sm text-[var(--text-muted)]">Loading task…</div>
        }
      >
        <TaskDetailContent id={id} />
      </Suspense>
    </RoleGuard>
  );
}

async function TaskDetailContent({ id }: { id: string }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'PROVIDER') redirect('/login');

  const detail = await getProviderTaskDetail(id, session.user.id);
  if (!detail) notFound();

  const inProgress = detail.status === 'IN_PROGRESS';
  const showProof =
    inProgress || detail.status === 'COMPLETED' || detail.status === 'VERIFIED';

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex flex-col gap-2">
        <Link
          href="/provider/tasks"
          className="inline-flex items-center gap-1 text-body-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={14} /> Back to Tasks
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-h1 font-semibold text-[var(--text-primary)]">
            {detail.assignment.id.slice(0, 8).toUpperCase()}: {detail.assignment.serviceTypeName}
          </h1>
          <span className="px-2 py-0.5 rounded text-label bg-[var(--surface-overlay)] text-[var(--text-secondary)]">
            {detail.assignment.status.replaceAll('_', ' ')}
          </span>
        </div>
        <p className="text-body-md text-[var(--text-secondary)] flex items-center gap-1.5">
          <MapPin size={14} />
          {detail.property.exactAddress
            ? detail.property.exactAddress
            : `${detail.property.zone} — exact address revealed after acceptance`}
        </p>
        <p className="text-body-sm text-[var(--text-muted)] tabular-nums">
          Payout:{' '}
          <span className="font-semibold text-[var(--text-primary)]">
            {formatTZS(detail.assignment.providerPayoutTZS)}
          </span>
        </p>
      </div>

      <AssignmentStepTracker status={detail.assignment.status as AssignmentStatus} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {showProof ? (
            <ProofOfWorkUpload taskId={detail.id} existing={detail.evidenceImages} />
          ) : (
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-6 text-body-sm text-[var(--text-muted)]">
              Check in via GPS to begin the task. Evidence upload unlocks once on site.
            </div>
          )}
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <GpsCheckInCard
            taskId={detail.id}
            propertyLat={detail.property.latitude}
            propertyLng={detail.property.longitude}
            alreadyCheckedIn={detail.checkInTime !== null}
          />
        </div>
      </div>
    </div>
  );
}
