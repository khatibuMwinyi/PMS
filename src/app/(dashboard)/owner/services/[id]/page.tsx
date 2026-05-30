// src/app/(dashboard)/owner/services/[id]/page.tsx
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Decimal from 'decimal.js';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/core/auth';
import { prisma } from '@/core/database/client';
import RoleGuard from '@/components/RoleGuard';
import { StatusBadge } from '@/features/services-list/components/StatusBadge';
import type { OwnerServiceStatus } from '@/features/services-list/schemas';
import type { AgreementStatus, AssignmentStatus } from '@prisma/client';
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

function toOwnerStatus(
  agreementStatus: AgreementStatus,
  assignmentStatus: AssignmentStatus | null | undefined,
): OwnerServiceStatus {
  if (assignmentStatus) {
    switch (assignmentStatus) {
      case 'PENDING_ACCEPTANCE': return 'PENDING_ACCEPTANCE';
      case 'ACCEPTED':
      case 'SCHEDULED': return 'SCHEDULED';
      case 'IN_PROGRESS': return 'IN_PROGRESS';
      case 'COMPLETED':
      case 'VERIFIED': return 'COMPLETED';
      case 'DISPUTED': return 'DISPUTED';
      case 'CANCELLED_BY_OWNER':
      case 'CANCELLED_NO_SHOW': return 'CANCELLED';
      default: return 'PENDING_ASSIGNMENT';
    }
  }
  switch (agreementStatus) {
    case 'QUOTED':
    case 'PENDING_ASSIGNMENT':
    case 'SUSPENDED': return 'PENDING_ASSIGNMENT';
    case 'ACTIVE': return 'SCHEDULED';
    case 'CANCELLED': return 'CANCELLED';
    case 'COMPLETED': return 'COMPLETED';
    default: return 'PENDING_ASSIGNMENT';
  }
}

function DetailField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[.05em] text-[#94A3B8] mb-1">{label}</p>
      <p className={`text-[13px] font-semibold text-[var(--text-primary)] ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function TimelineStep({
  label,
  value,
  state,
  isLast,
}: {
  label: string;
  value: string;
  state: 'done' | 'active' | 'pending';
  isLast: boolean;
}) {
  const dotClass = {
    done: 'bg-[var(--state-success)] ring-2 ring-[var(--state-success)] ring-offset-2',
    active: 'bg-[var(--brand-gold)] ring-2 ring-[var(--brand-gold)] ring-offset-2',
    pending: 'bg-white border-2 border-[var(--outline-variant)]',
  }[state];

  const labelClass = {
    done: 'text-sm font-medium text-[var(--text-primary)]',
    active: 'text-sm font-semibold text-[var(--state-warning)]',
    pending: 'text-sm font-medium text-[var(--text-muted)]',
  }[state];

  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${dotClass}`} />
        {!isLast && (
          <div className="w-px flex-1 min-h-[20px] bg-[var(--outline-variant)] mt-1 mb-1" />
        )}
      </div>
      <div className={isLast ? '' : 'pb-3'}>
        <p className={labelClass}>{label}</p>
        <p className="text-xs text-[var(--text-muted)] tabular-nums">{value}</p>
      </div>
    </li>
  );
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

  const displayStatus = toOwnerStatus(agreement.status, assignment?.status);

  const rawSteps = [
    { label: 'Quoted', value: dateLabel(agreement.createdAt), done: true },
    { label: 'Provider accepted', value: dateLabel(assignment?.acceptedAt), done: Boolean(assignment?.acceptedAt) },
    { label: 'Task completed', value: dateLabel(assignment?.completedAt), done: Boolean(assignment?.completedAt) },
    { label: 'Verified', value: dateLabel(assignment?.verifiedAt), done: Boolean(assignment?.verifiedAt) },
  ];

  let firstPendingSeen = false;
  const steps = rawSteps.map((s) => {
    if (s.done) return { ...s, state: 'done' as const };
    if (!firstPendingSeen) { firstPendingSeen = true; return { ...s, state: 'active' as const }; }
    return { ...s, state: 'pending' as const };
  });

  const sectionCard = 'bg-white border border-[var(--outline-variant)] rounded-[10px] p-5 shadow-[0_1px_3px_rgba(0,0,0,.04)]';
  const sectionHeading = 'text-[13px] font-bold uppercase tracking-[.05em] text-[#94A3B8] mb-4';

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
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            <span className="font-mono font-bold text-[var(--brand-gold)]">
              SRV-{agreement.id.slice(-6).toUpperCase()}
            </span>
            {' · '}{agreement.property.name}
            {agreement.property.zone && ` · ${agreement.property.zone}`}
          </p>
        </div>
        <StatusBadge status={displayStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">

          <section className={sectionCard}>
            <h2 className={sectionHeading}>Service Details</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <DetailField label="Service Type" value={agreement.serviceType.name} />
              <DetailField
                label="Quoted Price"
                value={formatTzs(new Decimal(agreement.quotedPrice.toString()))}
                mono
              />
              <DetailField label="Frequency" value={agreement.frequency} />
              <DetailField label="Property" value={agreement.property.name} />
              <DetailField label="Created" value={dateLabel(agreement.createdAt)} />
            </div>
          </section>

          <section className={sectionCard}>
            <h2 className={sectionHeading}>Timeline</h2>
            <ol className="space-y-0">
              {steps.map((step, i) => (
                <TimelineStep
                  key={step.label}
                  label={step.label}
                  value={step.value}
                  state={step.state}
                  isLast={i === steps.length - 1}
                />
              ))}
            </ol>
          </section>

          {invoice && (
            <section className={sectionCard}>
              <h2 className={sectionHeading}>Invoice</h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <DetailField
                  label="Amount"
                  value={formatTzs(new Decimal(invoice.amount.toString()))}
                  mono
                />
                <DetailField label="Status" value={invoice.status} />
                <DetailField label="Due" value={dateLabel(invoice.dueAt)} />
                <DetailField label="Paid" value={dateLabel(invoice.paidAt)} />
              </div>
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
