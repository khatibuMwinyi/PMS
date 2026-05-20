import 'server-only';
import { prisma } from '@/core/database/client';
import { AssignmentStatus } from '@prisma/client';
import type { RawServiceRow } from '../schemas';

export async function findOwnerServices(
  ownerUserId: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<{ rows: RawServiceRow[]; total: number }> {
  const requestedPage = Math.max(1, page);
  const skip = (requestedPage - 1) * pageSize;

  const where = { ownerId: ownerUserId };

  const [dbRows, total] = await Promise.all([
    prisma.agreement.findMany({
      where,
      select: {
        id: true,
        status: true,
        createdAt: true,
        serviceType: { select: { name: true } },
        property: { select: { name: true } },
        assignment: { select: { status: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.agreement.count({ where }),
  ]);

  const rows = dbRows.map((r) => ({
    agreementId: r.id,
    propertyName: r.property.name,
    serviceTypeName: r.serviceType.name,
    agreementStatus: r.status,
    assignmentStatus: r.assignment?.status ?? null,
    createdAt: r.createdAt,
  }));

  return { rows, total };
}

const ACTIVE_ASSIGNMENT_STATUSES = [
  AssignmentStatus.ACCEPTED,
  AssignmentStatus.SCHEDULED,
  AssignmentStatus.IN_PROGRESS,
  AssignmentStatus.COMPLETED,
] as const;

export async function countOwnerKpiBuckets(ownerUserId: string) {
  const [activeCount, scheduledCount, inProgressCount, disputedCount] =
    await Promise.all([
      prisma.assignment.count({
        where: {
          agreement: { ownerId: ownerUserId },
          status: { in: [...ACTIVE_ASSIGNMENT_STATUSES] },
        },
      }),
      prisma.assignment.count({
        where: {
          agreement: { ownerId: ownerUserId },
          status: { in: [AssignmentStatus.SCHEDULED, AssignmentStatus.ACCEPTED] },
        },
      }),
      prisma.assignment.count({
        where: {
          agreement: { ownerId: ownerUserId },
          status: AssignmentStatus.IN_PROGRESS,
        },
      }),
      prisma.assignment.count({
        where: {
          agreement: { ownerId: ownerUserId },
          status: AssignmentStatus.DISPUTED,
        },
      }),
    ]);

  return { activeCount, scheduledCount, inProgressCount, disputedCount };
}
