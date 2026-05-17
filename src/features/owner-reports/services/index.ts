import 'server-only';
import Decimal from 'decimal.js';
import { prisma } from '@/core/database/client';
import { InvoiceStatus } from '@prisma/client';

export interface MonthlySpend {
  monthLabel: string;
  amount: Decimal;
  amountFormatted: string;
}

export interface ServiceMixEntry {
  serviceTypeName: string;
  pct: number;
  amountFormatted: string;
}

export interface PropertyCostRow {
  propertyId: string;
  propertyName: string;
  zone: string;
  servicesYtdFormatted: string;
  utilityYtdFormatted: string;
  totalYtdFormatted: string;
  serviceCount: number;
}

function formatTzs(amount: Decimal): string {
  const fixed = amount.toFixed(0);
  const withCommas = fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `TZS ${withCommas}`;
}

export async function getMonthlySpend(ownerUserId: string): Promise<MonthlySpend[]> {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
  const rows = await prisma.invoice.findMany({
    where: {
      status: InvoiceStatus.PAID,
      paidAt: { gte: start },
      agreement: { ownerId: ownerUserId },
    },
    select: { amount: true, paidAt: true },
  });

  const buckets: Record<string, Decimal> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    buckets[`${d.getUTCFullYear()}-${d.getUTCMonth()}`] = new Decimal(0);
  }
  for (const r of rows) {
    if (!r.paidAt) continue;
    const key = `${r.paidAt.getUTCFullYear()}-${r.paidAt.getUTCMonth()}`;
    if (key in buckets) buckets[key] = buckets[key].plus(new Decimal(r.amount.toString()));
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return Object.entries(buckets).map(([key, amount]) => {
    const [, m] = key.split('-');
    return {
      monthLabel: monthNames[Number(m)],
      amount,
      amountFormatted: formatTzs(amount),
    };
  });
}

export async function getServiceMix(ownerUserId: string): Promise<ServiceMixEntry[]> {
  const rows = await prisma.invoice.findMany({
    where: {
      status: InvoiceStatus.PAID,
      agreement: { ownerId: ownerUserId },
    },
    select: {
      amount: true,
      agreement: { select: { serviceType: { select: { name: true } } } },
    },
  });

  const totals = new Map<string, Decimal>();
  let grand = new Decimal(0);
  for (const r of rows) {
    const name = r.agreement.serviceType.name;
    const amt = new Decimal(r.amount.toString());
    totals.set(name, (totals.get(name) ?? new Decimal(0)).plus(amt));
    grand = grand.plus(amt);
  }

  if (grand.isZero()) return [];
  return Array.from(totals.entries())
    .map(([name, amt]) => ({
      serviceTypeName: name,
      pct: Number(amt.div(grand).mul(100).toFixed(0)),
      amountFormatted: formatTzs(amt),
    }))
    .sort((a, b) => b.pct - a.pct);
}

export async function getPropertyCostBreakdown(ownerUserId: string): Promise<PropertyCostRow[]> {
  const now = new Date();
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));

  // Property.ownerId references OwnerProfile.id, not User.id — resolve first.
  const profile = await prisma.ownerProfile.findUnique({
    where: { userId: ownerUserId },
    select: { id: true },
  });
  if (!profile) return [];

  const properties = await prisma.property.findMany({
    where: { ownerId: profile.id },
    select: { id: true, name: true, zone: true },
  });

  const result: PropertyCostRow[] = [];
  for (const p of properties) {
    const [invoices, utilities] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          status: InvoiceStatus.PAID,
          paidAt: { gte: yearStart },
          agreement: { propertyId: p.id, ownerId: ownerUserId },
        },
        select: { amount: true },
      }),
      prisma.utilityBill.findMany({
        where: {
          propertyId: p.id,
          createdAt: { gte: yearStart },
        },
        select: { amount: true },
      }),
    ]);
    const services = invoices.reduce(
      (acc, i) => acc.plus(new Decimal(i.amount.toString())),
      new Decimal(0),
    );
    const utility = utilities.reduce(
      (acc, u) => acc.plus(new Decimal(u.amount.toString())),
      new Decimal(0),
    );
    result.push({
      propertyId: p.id,
      propertyName: p.name,
      zone: p.zone ?? '—',
      servicesYtdFormatted: formatTzs(services),
      utilityYtdFormatted: formatTzs(utility),
      totalYtdFormatted: formatTzs(services.plus(utility)),
      serviceCount: invoices.length,
    });
  }

  return result.sort((a, b) => b.serviceCount - a.serviceCount);
}
