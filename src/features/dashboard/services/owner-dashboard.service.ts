// src/features/dashboard/services/owner-dashboard.service.ts
import Decimal from 'decimal.js';
import { AgreementStatus, AssignmentStatus, type Prisma } from '@prisma/client';
import {
  findOwnerProfileIdByUserId,
  findPaidInvoicesInRange,
  countAssignmentsByStatus,
  countAgreementsByStatus,
  findActiveProperties,
  findRecentRequests,
} from '@/features/dashboard/repositories/owner-dashboard.repository';
import type {
  OwnerKpis,
  OwnerPropertyCard,
  OwnerRecentRequest,
  OwnerVisibleAgreementStatus,
  StatusVariant,
  TrendDirection,
} from '@/features/dashboard/schemas/owner-dashboard.schema';

// ─── Status mapping ─────────────────────────────────────────────────

/**
 * Collapse the internal Agreement+Assignment status pair into a single
 * owner-visible status. Assignment status takes precedence when present,
 * since it reflects the actual fulfillment state the owner cares about.
 */
export function mapToOwnerStatus(
  agreementStatus: AgreementStatus,
  assignmentStatus: AssignmentStatus | null,
): OwnerVisibleAgreementStatus {
  if (assignmentStatus) {
    switch (assignmentStatus) {
      case AssignmentStatus.PENDING_ACCEPTANCE: return 'PENDING_ACCEPTANCE';
      case AssignmentStatus.ACCEPTED:
      case AssignmentStatus.SCHEDULED: return 'SCHEDULED';
      case AssignmentStatus.IN_PROGRESS: return 'IN_PROGRESS';
      case AssignmentStatus.COMPLETED:
      case AssignmentStatus.VERIFIED: return 'COMPLETED';
      case AssignmentStatus.DISPUTED: return 'DISPUTED';
      case AssignmentStatus.EXPIRED:
      case AssignmentStatus.REJECTED:
      case AssignmentStatus.AUTO_REASSIGNED:
      case AssignmentStatus.NO_PROVIDER_AVAILABLE:
        return 'PENDING_ASSIGNMENT';
      case AssignmentStatus.CANCELLED_BY_OWNER:
      case AssignmentStatus.CANCELLED_NO_SHOW:
        return 'CANCELLED';
      default: {
        const _exhaustive: never = assignmentStatus;
        throw new Error(`Unhandled AssignmentStatus: ${String(_exhaustive)}`);
      }
    }
  }
  switch (agreementStatus) {
    case AgreementStatus.QUOTED:
    case AgreementStatus.PENDING_ASSIGNMENT: return 'PENDING_ASSIGNMENT';
    case AgreementStatus.ACTIVE: return 'SCHEDULED';
    case AgreementStatus.SUSPENDED: return 'PENDING_ASSIGNMENT';
    case AgreementStatus.CANCELLED: return 'CANCELLED';
    case AgreementStatus.COMPLETED: return 'COMPLETED';
    default: {
      const _exhaustive: never = agreementStatus;
      throw new Error(`Unhandled AgreementStatus: ${String(_exhaustive)}`);
    }
  }
}

export function statusVariant(s: OwnerVisibleAgreementStatus): StatusVariant {
  switch (s) {
    case 'DISPUTED': return 'urgent';
    case 'IN_PROGRESS': return 'progress';
    case 'SCHEDULED':
    case 'PENDING_ACCEPTANCE':
    case 'PENDING_ASSIGNMENT': return 'scheduled';
    case 'COMPLETED': return 'complete';
    case 'CANCELLED': return 'neutral';
    default: {
      const _exhaustive: never = s;
      throw new Error(`Unhandled OwnerVisibleAgreementStatus: ${String(_exhaustive)}`);
    }
  }
}

// ─── Currency formatting ────────────────────────────────────────────

export function formatTzs(amount: Decimal): string {
  const fixed = amount.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `TZS ${withCommas}.${decPart}`;
}

export function formatPct(pct: Decimal): string {
  if (pct.isNaN() || !pct.isFinite()) return '—';
  return `${pct.toFixed(1)}%`;
}

// ─── Date / age formatting ──────────────────────────────────────────

export function formatAge(createdAt: Date, now: Date): string {
  const diffMs = now.getTime() - createdAt.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${Math.floor(diffH)}h ago`;
  return createdAt.toLocaleString('en-GB', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

// ─── Trend math ─────────────────────────────────────────────────────

export function computeTrend(current: Decimal, prior: Decimal): {
  pct: Decimal | null;
  direction: TrendDirection | null;
} {
  if (prior.isZero()) return { pct: null, direction: null };
  const pct = current.minus(prior).div(prior).mul(100);
  const direction: TrendDirection = pct.isZero() ? 'flat' : pct.isPositive() ? 'up' : 'down';
  return { pct: pct.abs(), direction };
}

// ─── KPI assembler ──────────────────────────────────────────────────

const ACTIVE_ASSIGNMENT_STATUSES = [
  AssignmentStatus.ACCEPTED,
  AssignmentStatus.SCHEDULED,
  AssignmentStatus.IN_PROGRESS,
  AssignmentStatus.COMPLETED,
] as const;

export async function buildOwnerKpis(
  ownerUserId: string,
  now: Date = new Date(),
): Promise<OwnerKpis> {
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const priorYearStart = new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1));
  const priorYearSameDay = new Date(Date.UTC(
    now.getUTCFullYear() - 1, now.getUTCMonth(), now.getUTCDate(),
    now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(),
  ));

  const [currentPaid, priorPaid, activeWorkOrders, pendingAcceptance, completedAg, paidAg] =
    await Promise.all([
      findPaidInvoicesInRange(ownerUserId, yearStart, now),
      findPaidInvoicesInRange(ownerUserId, priorYearStart, priorYearSameDay),
      countAssignmentsByStatus(ownerUserId, [...ACTIVE_ASSIGNMENT_STATUSES]),
      countAssignmentsByStatus(ownerUserId, [AssignmentStatus.PENDING_ACCEPTANCE]),
      countAgreementsByStatus(ownerUserId, [AgreementStatus.COMPLETED]),
      // "paid agreements" = agreements with a PAID invoice = agreements not QUOTED/CANCELLED
      countAgreementsByStatus(ownerUserId, [
        AgreementStatus.ACTIVE, AgreementStatus.COMPLETED, AgreementStatus.SUSPENDED,
      ]),
    ]);

  const sum = (rows: { amount: Prisma.Decimal }[]) =>
    rows.reduce((acc, r) => acc.plus(new Decimal(r.amount.toString())), new Decimal(0));

  const totalSpentYtd = sum(currentPaid);
  const priorTotal = sum(priorPaid);
  const { pct: ytdTrendPct, direction: ytdTrendDirection } = computeTrend(totalSpentYtd, priorTotal);

  const maintenanceRoiPct = paidAg === 0
    ? new Decimal(0)
    : new Decimal(completedAg).div(paidAg).mul(100);

  return {
    totalSpentYtd,
    totalSpentYtdFormatted: formatTzs(totalSpentYtd),
    ytdTrendPct,
    ytdTrendDirection,
    activeWorkOrders,
    pendingAcceptance,
    maintenanceRoiPct,
    maintenanceRoiFormatted: paidAg === 0 ? '—' : formatPct(maintenanceRoiPct),
    asOf: now,
  };
}

// ─── Property card assembler ────────────────────────────────────────

export async function buildActivePropertyCards(
  ownerUserId: string,
  limit: number = 4,
): Promise<OwnerPropertyCard[]> {
  const ownerProfileId = await findOwnerProfileIdByUserId(ownerUserId);
  if (!ownerProfileId) return [];

  const rows = await findActiveProperties(ownerProfileId, limit);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    addressLine: r.zone || 'Address not set',
    unitCount: r.unitCount,
    occupancyPct: r.unitsTotal === 0
      ? 0
      : Math.round((r.unitsOccupied / r.unitsTotal) * 100),
    imageUrl: r.imageUrls[0] ?? null,
    isActive: true,
    hrefDetail: `/owner/properties/${r.id}`,
  }));
}

// ─── Recent requests assembler ──────────────────────────────────────

export async function buildRecentRequests(
  ownerUserId: string,
  limit: number = 5,
  now: Date = new Date(),
): Promise<OwnerRecentRequest[]> {
  const rows = await findRecentRequests(ownerUserId, limit);
  return rows.map((r) => {
    const status = mapToOwnerStatus(r.agreementStatus, r.assignmentStatus);
    return {
      agreementId: r.agreementId,
      serviceTypeName: r.serviceTypeName,
      propertyName: r.propertyName,
      status,
      statusVariant: statusVariant(status),
      ageHuman: formatAge(r.createdAt, now),
      hrefDetail: `/owner/work-orders/${r.agreementId}`,
    };
  });
}

// Exported for unit tests
export const __forTest = { ACTIVE_ASSIGNMENT_STATUSES };
