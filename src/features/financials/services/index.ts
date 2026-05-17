import 'server-only';
import Decimal from 'decimal.js';
import { findOwnerInvoices, aggregateOwnerInvoices, type OwnerInvoiceRow } from '../repositories';

export function formatTzs(amount: Decimal | null): string {
  const a = amount ?? new Decimal(0);
  const fixed = a.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `TZS ${withCommas}.${decPart}`;
}

export interface FinancialsSummary {
  paidYtdFormatted: string;
  pendingFormatted: string;
  pendingCount: number;
  nextDueFormatted: string | null;
  utilityYtdFormatted: string;
}

export async function getOwnerFinancialsSummary(ownerUserId: string): Promise<FinancialsSummary> {
  const now = new Date();
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const agg = await aggregateOwnerInvoices(ownerUserId, yearStart, now);

  return {
    paidYtdFormatted: formatTzs(agg.paidYtdSum ? new Decimal(agg.paidYtdSum.toString()) : null),
    pendingFormatted: formatTzs(agg.pendingSum ? new Decimal(agg.pendingSum.toString()) : null),
    pendingCount: agg.pendingCount,
    nextDueFormatted: agg.nextDueAt
      ? agg.nextDueAt.toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
          timeZone: 'Africa/Dar_es_Salaam',
        })
      : null,
    utilityYtdFormatted: formatTzs(
      agg.utilityYtdSum ? new Decimal(agg.utilityYtdSum.toString()) : null,
    ),
  };
}

export interface OwnerInvoiceDisplay {
  id: string;
  shortRef: string;
  propertyName: string;
  serviceTypeName: string;
  amountFormatted: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'FAILED' | 'CANCELLED';
  dateFormatted: string;
  attempts: number;
}

export async function getOwnerInvoicesList(ownerUserId: string): Promise<OwnerInvoiceDisplay[]> {
  const rows = await findOwnerInvoices(ownerUserId);
  const now = Date.now();

  return rows.map((r: OwnerInvoiceRow) => ({
    id: r.id,
    shortRef: `INV-${r.id.slice(-6).toUpperCase()}`,
    propertyName: r.propertyName,
    serviceTypeName: r.serviceTypeName,
    amountFormatted: formatTzs(new Decimal(r.amount.toString())),
    status: derivedStatus(r, now),
    dateFormatted: r.createdAt.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      timeZone: 'Africa/Dar_es_Salaam',
    }),
    attempts: r.attempts,
  }));
}

function derivedStatus(r: OwnerInvoiceRow, nowMs: number): OwnerInvoiceDisplay['status'] {
  if (r.status === 'PAID') return 'PAID';
  if (r.status === 'CANCELLED') return 'CANCELLED';
  if (r.status === 'FAILED') return 'FAILED';
  if (r.dueAt.getTime() < nowMs) return 'OVERDUE';
  return 'PENDING';
}
