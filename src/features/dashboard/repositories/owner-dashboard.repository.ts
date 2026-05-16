// src/features/dashboard/repositories/owner-dashboard.repository.ts
import { prisma } from '@/core/database/client';
import {
  AgreementStatus, AssignmentStatus, InvoiceStatus, PropertyType,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';

export interface PaidInvoiceRow {
  amount: Prisma.Decimal;
  paidAt: Date;
}

export interface ActivePropertyRow {
  id: string;
  name: string;
  type: PropertyType;
  zone: string;
  imageUrls: string[];
  unitCount: number;
  unitsOccupied: number;
  unitsTotal: number;
  updatedAt: Date;
}

export interface RecentRequestRow {
  agreementId: string;
  serviceTypeName: string;
  propertyName: string;
  agreementStatus: AgreementStatus;
  assignmentStatus: AssignmentStatus | null;
  createdAt: Date;
}

/**
 * Resolve the OwnerProfile id for a session userId.
 * Returns null when the user has no OwnerProfile (treated as zero-state).
 */
export async function findOwnerProfileIdByUserId(userId: string): Promise<string | null> {
  const profile = await prisma.ownerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return profile?.id ?? null;
}

/** Sum of paid invoices for owner, within [start, end). */
export async function findPaidInvoicesInRange(
  ownerUserId: string,
  start: Date,
  end: Date,
): Promise<PaidInvoiceRow[]> {
  const rows = await prisma.invoice.findMany({
    where: {
      status: InvoiceStatus.PAID,
      paidAt: { gte: start, lt: end },
      agreement: { ownerId: ownerUserId },
    },
    select: { amount: true, paidAt: true },
  });

  // PAID invoices always have `paidAt` set; the schema column is nullable but
  // the `paidAt: { gte, lt }` filter above already excludes nulls.
  return rows
    .filter((r): r is { amount: Prisma.Decimal; paidAt: Date } => r.paidAt !== null);
}

/** Count assignments by status set for owner. */
export async function countAssignmentsByStatus(
  ownerUserId: string,
  statuses: AssignmentStatus[],
): Promise<number> {
  return prisma.assignment.count({
    where: {
      status: { in: statuses },
      agreement: { ownerId: ownerUserId },
    },
  });
}

/** Counts used for ROI: completed agreements / paid agreements. */
export async function countAgreementsByStatus(
  ownerUserId: string,
  statuses: AgreementStatus[],
): Promise<number> {
  return prisma.agreement.count({
    where: {
      ownerId: ownerUserId,
      status: { in: statuses },
    },
  });
}

/**
 * Active properties for the owner, most-recently-updated first.
 * Does NOT select `encryptedAddress` (would be auto-decrypted by Prisma extension).
 * Uses `zone` (plaintext) for the card address line.
 */
export async function findActiveProperties(
  ownerProfileId: string,
  limit: number,
): Promise<ActivePropertyRow[]> {
  const properties = await prisma.property.findMany({
    where: { ownerId: ownerProfileId, status: 'ACTIVE' },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      type: true,
      zone: true,
      imageUrls: true,
      unitCount: true,
      updatedAt: true,
      units: { select: { occupantCount: true } },
    },
  });

  return properties.map((p) => {
    const unitsTotal = p.units.length;
    const unitsOccupied = p.units.filter((u) => u.occupantCount > 0).length;
    return {
      id: p.id,
      name: p.name,
      type: p.type,
      zone: p.zone,
      imageUrls: p.imageUrls,
      unitCount: p.unitCount,
      unitsOccupied,
      unitsTotal,
      updatedAt: p.updatedAt,
    };
  });
}

/**
 * Recent agreements for the owner, most-recently-created first.
 * Excludes provider identity at the select clause.
 */
export async function findRecentRequests(
  ownerUserId: string,
  limit: number,
): Promise<RecentRequestRow[]> {
  const rows = await prisma.agreement.findMany({
    where: { ownerId: ownerUserId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      status: true,
      createdAt: true,
      property: { select: { name: true } },
      serviceType: { select: { name: true } },
      assignment: { select: { status: true } },
    },
  });

  return rows.map((r) => ({
    agreementId: r.id,
    serviceTypeName: r.serviceType.name,
    propertyName: r.property.name,
    agreementStatus: r.status,
    assignmentStatus: r.assignment?.status ?? null,
    createdAt: r.createdAt,
  }));
}
