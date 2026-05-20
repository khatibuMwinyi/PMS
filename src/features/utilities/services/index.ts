import 'server-only';
import Decimal from 'decimal.js';
import { prisma } from '@/core/database/client';

export interface UtilityBillListResult {
  rows: UtilityBillRow[];
  total: number;
}

export interface UtilityBillRow {
  id: string;
  propertyName: string;
  type: string;
  amountFormatted: string;
  billingPeriod: string;
  allocationMethod: string;
  createdAtFormatted: string;
}

function formatTzs(amount: Decimal): string {
  return `TZS ${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export async function getOwnerUtilities(
  ownerUserId: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<UtilityBillListResult> {
  const profile = await prisma.ownerProfile.findUnique({
    where: { userId: ownerUserId },
    select: { id: true },
  });
  if (!profile) return { rows: [], total: 0 };

  const requestedPage = Math.max(1, page);
  const skip = (requestedPage - 1) * pageSize;
  const where = { property: { ownerId: profile.id } };

  const [dbRows, total] = await Promise.all([
    prisma.utilityBill.findMany({
      where,
      select: {
        id: true,
        type: true,
        amount: true,
        billingPeriod: true,
        allocationMethod: true,
        createdAt: true,
        property: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.utilityBill.count({ where }),
  ]);

  const rows = dbRows.map((r) => ({
    id: r.id,
    propertyName: r.property.name,
    type: r.type,
    amountFormatted: formatTzs(new Decimal(r.amount.toString())),
    billingPeriod: r.billingPeriod,
    allocationMethod: r.allocationMethod,
    createdAtFormatted: r.createdAt.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      timeZone: 'Africa/Dar_es_Salaam',
    }),
  }));

  return { rows, total };
}

export async function getOwnerPropertiesForUtility(ownerUserId: string) {
  const profile = await prisma.ownerProfile.findUnique({
    where: { userId: ownerUserId },
    select: { id: true },
  });
  if (!profile) return [];

  return prisma.property.findMany({
    where: { ownerId: profile.id },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}
