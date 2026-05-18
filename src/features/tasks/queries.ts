'use server';

import { prisma } from '@/core/database/client';

export interface ProviderTaskDetail {
  id: string;
  scheduledFor: string;
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  evidenceImages: string[];
  pendingPhotoVerification: boolean;
  assignment: {
    id: string;
    status: string;
    providerPayoutTZS: string;
    expiresAt: string;
    acceptedAt: string | null;
    scheduledDate: string | null;
    serviceTypeName: string;
  };
  property: {
    zone: string;
    latitude: number;
    longitude: number;
    exactAddress: string | null; // null pre-acceptance
  };
}

/**
 * Statuses at/after which the provider may see the property's exact address.
 * Per Full.md §XXI Isolation Principle: zone is always visible, exact address
 * is withheld until the assignment has been ACCEPTED (or later lifecycle state).
 */
const POST_ACCEPTANCE: ReadonlySet<string> = new Set([
  'ACCEPTED',
  'IN_PROGRESS',
  'COMPLETED',
  'DISPUTED',
  'VERIFIED',
]);

/**
 * Fetch a single task's detail for the logged-in provider.
 *
 * ⚠ Isolation Principle enforced at the select clause:
 *   • Owner relation / ownerId are NEVER selected.
 *   • `property.encryptedAddress` is auto-decrypted by the prisma extension;
 *     it is gated behind POST_ACCEPTANCE and otherwise returned as `null`.
 *
 * @param taskId          Task id to fetch.
 * @param providerUserId  Logged-in user id (NOT providerProfile.id).
 * @returns               Shaped detail object, or `null` if the task is not
 *                        owned by the provider (or the user has no provider profile).
 */
export async function getProviderTaskDetail(
  taskId: string,
  providerUserId: string,
): Promise<ProviderTaskDetail | null> {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId: providerUserId },
    select: { id: true },
  });
  if (!provider) return null;

  const task = await prisma.task.findFirst({
    where: { id: taskId, assignment: { providerId: provider.id } },
    select: {
      id: true,
      scheduledFor: true,
      status: true,
      checkInTime: true,
      checkOutTime: true,
      evidenceImages: true,
      pendingPhotoVerification: true,
      assignment: {
        select: {
          id: true,
          status: true,
          providerPayout: true,
          expiresAt: true,
          acceptedAt: true,
          scheduledDate: true,
          serviceType: { select: { name: true } },
          property: {
            select: {
              zone: true,
              latitude: true,
              longitude: true,
              encryptedAddress: true,
            },
          },
        },
      },
    },
  });
  if (!task) return null;

  const a = task.assignment;
  const revealAddress = POST_ACCEPTANCE.has(a.status);

  return {
    id: task.id,
    scheduledFor: task.scheduledFor.toISOString(),
    status: task.status,
    checkInTime: task.checkInTime?.toISOString() ?? null,
    checkOutTime: task.checkOutTime?.toISOString() ?? null,
    evidenceImages: task.evidenceImages,
    pendingPhotoVerification: task.pendingPhotoVerification,
    assignment: {
      id: a.id,
      status: a.status,
      providerPayoutTZS: a.providerPayout.toString(),
      expiresAt: a.expiresAt.toISOString(),
      acceptedAt: a.acceptedAt?.toISOString() ?? null,
      scheduledDate: a.scheduledDate?.toISOString() ?? null,
      serviceTypeName: a.serviceType.name,
    },
    property: {
      zone: a.property.zone,
      latitude: a.property.latitude,
      longitude: a.property.longitude,
      exactAddress: revealAddress ? a.property.encryptedAddress ?? null : null,
    },
  };
}

export type HistoryStatus = 'COMPLETED' | 'VERIFIED' | 'DISPUTED' | 'OVERDUE' | 'CANCELLED';

export interface HistoryRow {
  id: string;
  scheduledFor: string;
  uiStatus: HistoryStatus;
  serviceTypeName: string;
  zone: string;
  providerPayoutTZS: string;
}

export interface HistoryResult {
  rows: HistoryRow[];
  total: number;
  page: number;
  pageSize: number;
}

const CANCELLATION_ASSIGNMENT_STATUSES = [
  'CANCELLED_BY_OWNER',
  'CANCELLED_NO_SHOW',
  'EXPIRED',
  'REJECTED',
  'AUTO_REASSIGNED',
] as const;
const TASK_TERMINAL_STATUSES = ['COMPLETED', 'VERIFIED', 'DISPUTED', 'OVERDUE'] as const;

function buildStatusOr(statuses: HistoryStatus[]) {
  const wanted =
    statuses.length > 0
      ? statuses
      : (['COMPLETED', 'VERIFIED', 'DISPUTED', 'OVERDUE', 'CANCELLED'] as HistoryStatus[]);
  const taskStatuses = wanted.filter((s): s is Exclude<HistoryStatus, 'CANCELLED'> => s !== 'CANCELLED');
  const includeCancelled = wanted.includes('CANCELLED');

  const or: Array<Record<string, unknown>> = [];
  if (taskStatuses.length > 0) {
    or.push({ status: { in: taskStatuses } });
  }
  if (includeCancelled) {
    or.push({ assignment: { status: { in: [...CANCELLATION_ASSIGNMENT_STATUSES] } } });
  }
  return or;
}

function deriveUiStatus(taskStatus: string, assignmentStatus: string): HistoryStatus {
  if ((CANCELLATION_ASSIGNMENT_STATUSES as readonly string[]).includes(assignmentStatus)) return 'CANCELLED';
  if ((TASK_TERMINAL_STATUSES as readonly string[]).includes(taskStatus)) return taskStatus as HistoryStatus;
  return 'COMPLETED';
}

/**
 * Fetch the provider's paginated task history.
 *
 * Enforces:
 *   • Ownership gate: providerProfile lookup by userId; empty result when missing.
 *   • 90-day window applied to `scheduledFor` server-side.
 *   • PII-safe `select`: owner relation, ownerId, and encryptedAddress are never selected.
 *   • UI status mapping: the 5-value union (COMPLETED, VERIFIED, DISPUTED, OVERDUE, CANCELLED)
 *     is translated to the appropriate task.status / assignment.status predicates via OR.
 *   • Page clamping: page < 1 → 1; page > totalPages → totalPages (re-fetch with clamped page).
 */
export async function getProviderTaskHistory(
  providerUserId: string,
  filters: { statuses: HistoryStatus[] },
  page: number,
  pageSize: number,
): Promise<HistoryResult> {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId: providerUserId },
    select: { id: true },
  });
  if (!provider) {
    return { rows: [], total: 0, page: Math.max(1, page), pageSize };
  }

  const requestedPage = Math.max(1, page);
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const orPredicate = buildStatusOr(filters.statuses);

  const where = {
    assignment: { providerId: provider.id },
    scheduledFor: { gte: since },
    OR: orPredicate,
  };

  const select = {
    id: true,
    scheduledFor: true,
    status: true,
    assignment: {
      select: {
        id: true,
        status: true,
        providerPayout: true,
        serviceType: { select: { name: true } },
        property: { select: { zone: true } },
      },
    },
  };

  // First pass — use the requested page.
  let effectivePage = requestedPage;
  let rows = await prisma.task.findMany({
    where,
    select,
    orderBy: { scheduledFor: 'desc' },
    skip: (effectivePage - 1) * pageSize,
    take: pageSize,
  });
  const total = await prisma.task.count({ where });

  // If requested page is past the end, clamp and re-fetch.
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (effectivePage > totalPages) {
    effectivePage = totalPages;
    rows = await prisma.task.findMany({
      where,
      select,
      orderBy: { scheduledFor: 'desc' },
      skip: (effectivePage - 1) * pageSize,
      take: pageSize,
    });
  }

  return {
    rows: rows.map((t) => ({
      id: t.id,
      scheduledFor: t.scheduledFor.toISOString(),
      uiStatus: deriveUiStatus(t.status, t.assignment.status),
      serviceTypeName: t.assignment.serviceType.name,
      zone: t.assignment.property.zone,
      providerPayoutTZS: t.assignment.providerPayout.toString(),
    })),
    total,
    page: effectivePage,
    pageSize,
  };
}
