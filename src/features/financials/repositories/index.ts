import 'server-only';
import { prisma } from '@/core/database/client';
import { InvoiceStatus, type Prisma } from '@prisma/client';

export interface OwnerInvoiceRow {
  id: string;
  amount: Prisma.Decimal;
  status: InvoiceStatus;
  dueAt: Date;
  paidAt: Date | null;
  createdAt: Date;
  attempts: number;
  propertyName: string;
  serviceTypeName: string;
}

export async function findOwnerInvoices(
  ownerUserId: string,
  limit: number = 50,
): Promise<OwnerInvoiceRow[]> {
  const rows = await prisma.invoice.findMany({
    where: { agreement: { ownerId: ownerUserId } },
    select: {
      id: true,
      amount: true,
      status: true,
      dueAt: true,
      paidAt: true,
      createdAt: true,
      attempts: true,
      agreement: {
        select: {
          property: { select: { name: true } },
          serviceType: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return rows.map((r) => ({
    id: r.id,
    amount: r.amount,
    status: r.status,
    dueAt: r.dueAt,
    paidAt: r.paidAt,
    createdAt: r.createdAt,
    attempts: r.attempts,
    propertyName: r.agreement.property.name,
    serviceTypeName: r.agreement.serviceType.name,
  }));
}

export async function aggregateOwnerInvoices(ownerUserId: string, yearStart: Date, now: Date) {
  // Property.ownerId references OwnerProfile.id — resolve before utility scan.
  const profile = await prisma.ownerProfile.findUnique({
    where: { userId: ownerUserId },
    select: { id: true },
  });

  const [paidYtd, pending, utilityYtd] = await Promise.all([
    prisma.invoice.aggregate({
      _sum: { amount: true },
      where: {
        status: InvoiceStatus.PAID,
        paidAt: { gte: yearStart, lt: now },
        agreement: { ownerId: ownerUserId },
      },
    }),
    prisma.invoice.aggregate({
      _sum: { amount: true },
      _count: { _all: true },
      _min: { dueAt: true },
      where: {
        status: InvoiceStatus.PENDING,
        agreement: { ownerId: ownerUserId },
      },
    }),
    profile
      ? prisma.utilityBill.aggregate({
          _sum: { amount: true },
          where: {
            createdAt: { gte: yearStart, lt: now },
            property: { ownerId: profile.id },
          },
        })
      : Promise.resolve({ _sum: { amount: null as Prisma.Decimal | null } }),
  ]);

  return {
    paidYtdSum: paidYtd._sum.amount ?? null,
    pendingSum: pending._sum.amount ?? null,
    pendingCount: pending._count._all,
    nextDueAt: pending._min.dueAt,
    utilityYtdSum: utilityYtd._sum.amount ?? null,
  };
}
