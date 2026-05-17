import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Decimal from 'decimal.js';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/core/auth';
import { prisma } from '@/core/database/client';
import RoleGuard from '@/components/RoleGuard';
import { OwnerServiceActions } from './OwnerServiceActions';

export const dynamic = 'force-dynamic';

function formatTzs(amount: Decimal): string {
  return `TZS ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function dateLabel(d: Date | null | undefined): string {
  if (!d) return '—';
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'Africa/Dar_es_Salaam',
  });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OwnerServiceDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  const { id } = await params;

  const agreement = await prisma.agreement.findUnique({
    where: { id },
    include: {
      property: { select: { name: true, zone: true } },
      serviceType: { select: { name: true, description: true } },
      assignment: {
        select: {
          id: true,
          status: true,
          expiresAt: true,
          acceptedAt: true,
          completedAt: true,
          verifiedAt: true,
          disputedAt: true,
          tasks: {
            select: { id: true, status: true, scheduledFor: true, checkInTime: true },
            orderBy: { scheduledFor: 'desc' },
          },
        },
      },
      invoice: {
        select: { id: true, amount: true, status: true, dueAt: true, paidAt: true },
      },
    },
  });

  if (!agreement) notFound();
  if (agreement.ownerId !== session.user.id) notFound();

  const assignment = agreement.assignment;
  const invoice = agreement.invoice;
  const latestCompleted = assignment?.tasks.find((t) => t.status === 'COMPLETED');

  // Spec §VII: 24h verification window after task completion.
  const verificationDeadline = latestCompleted && assignment?.completedAt
    ? new Date(assignment.completedAt.getTime() + 24 * 60 * 60 * 1000)
    : null;

  const canCancel =
    !assignment ||
    ['PENDING_ACCEPTANCE'].includes(assignment.status) ||
    (assignment.status === 'ACCEPTED' && !assignment.tasks.some((t) => t.status === 'IN_PROGRESS'));

  const canVerify = assignment?.status === 'COMPLETED';
  const canDispute = assignment?.status === 'COMPLETED' &&
    verificationDeadline !== null &&
    Date.now() < verificationDeadline.getTime();

  const cancelPenaltyApplies = Boolean(
    assignment && assignment.status !== 'PENDING_ACCEPTANCE',
  );

  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <Link
        href="/owner/services"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-3"
      >
        <ArrowLeft size={14} /> Back to Services
      </Link>

      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            {agreement.serviceType.name}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Service ref: SRV-{agreement.id.slice(-6).toUpperCase()} · {agreement.property.name}
            {agreement.property.zone && ` · ${agreement.property.zone}`}
          </p>
        </div>
        <span className="badge-status bg-[var(--surface-container-high)] text-[var(--text-primary)]">
          {assignment?.status ?? agreement.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <section className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-5">
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
              Service details
            </h2>
            <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
              <dt className="text-[var(--text-muted)]">Service type</dt>
              <dd className="text-[var(--text-primary)]">{agreement.serviceType.name}</dd>

              <dt className="text-[var(--text-muted)]">Quoted price</dt>
              <dd className="text-[var(--text-primary)] tabular-nums">
                {formatTzs(new Decimal(agreement.quotedPrice.toString()))}
              </dd>

              <dt className="text-[var(--text-muted)]">Frequency</dt>
              <dd className="text-[var(--text-primary)]">{agreement.frequency}</dd>

              <dt className="text-[var(--text-muted)]">Property</dt>
              <dd className="text-[var(--text-primary)]">{agreement.property.name}</dd>

              <dt className="text-[var(--text-muted)]">Created</dt>
              <dd className="text-[var(--text-primary)]">{dateLabel(agreement.createdAt)}</dd>
            </dl>
          </section>

          <section className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-5">
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">Timeline</h2>
            <ol className="space-y-3 text-sm">
              <TimelineRow
                label="Quoted"
                value={dateLabel(agreement.createdAt)}
                done
              />
              <TimelineRow
                label="Provider accepted"
                value={dateLabel(assignment?.acceptedAt)}
                done={Boolean(assignment?.acceptedAt)}
              />
              <TimelineRow
                label="Task completed"
                value={dateLabel(assignment?.completedAt)}
                done={Boolean(assignment?.completedAt)}
              />
              <TimelineRow
                label="Verified"
                value={dateLabel(assignment?.verifiedAt)}
                done={Boolean(assignment?.verifiedAt)}
              />
            </ol>
          </section>

          {invoice && (
            <section className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-5">
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">Invoice</h2>
              <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <dt className="text-[var(--text-muted)]">Amount</dt>
                <dd className="tabular-nums font-semibold">
                  {formatTzs(new Decimal(invoice.amount.toString()))}
                </dd>
                <dt className="text-[var(--text-muted)]">Status</dt>
                <dd>{invoice.status}</dd>
                <dt className="text-[var(--text-muted)]">Due</dt>
                <dd>{dateLabel(invoice.dueAt)}</dd>
                <dt className="text-[var(--text-muted)]">Paid</dt>
                <dd>{dateLabel(invoice.paidAt)}</dd>
              </dl>
            </section>
          )}
        </div>

        <aside>
          <OwnerServiceActions
            agreementId={agreement.id}
            quotedPrice={agreement.quotedPrice.toString()}
            canCancel={canCancel}
            canVerify={canVerify}
            canDispute={canDispute}
            cancelPenaltyApplies={cancelPenaltyApplies}
            verificationDeadlineIso={verificationDeadline?.toISOString() ?? null}
          />
        </aside>
      </div>
    </RoleGuard>
  );
}

function TimelineRow({
  label,
  value,
  done,
}: {
  label: string;
  value: string;
  done: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <div
        className={[
          'mt-1 w-2.5 h-2.5 rounded-full shrink-0',
          done ? 'bg-[var(--state-success)]' : 'bg-[var(--outline-variant)]',
        ].join(' ')}
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-xs text-[var(--text-muted)] tabular-nums">{value}</p>
      </div>
    </li>
  );
}
