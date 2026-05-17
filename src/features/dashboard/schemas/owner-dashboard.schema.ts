// src/features/dashboard/schemas/owner-dashboard.schema.ts
import { z } from 'zod';
import Decimal from 'decimal.js';
import { PropertyType } from '@prisma/client';

const OWNER_VISIBLE_AGREEMENT_STATUSES = [
  'PENDING_ASSIGNMENT', 'PENDING_ACCEPTANCE', 'SCHEDULED',
  'IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'CANCELLED',
] as const;
export type OwnerVisibleAgreementStatus = typeof OWNER_VISIBLE_AGREEMENT_STATUSES[number];

const STATUS_VARIANTS = ['urgent', 'progress', 'scheduled', 'complete', 'neutral'] as const;
export type StatusVariant = typeof STATUS_VARIANTS[number];

const TREND_DIRECTIONS = ['up', 'down', 'flat'] as const;
export type TrendDirection = typeof TREND_DIRECTIONS[number];

export interface OwnerKpis {
  totalSpentYtd: Decimal;
  totalSpentYtdFormatted: string;
  ytdTrendPct: Decimal | null;
  ytdTrendDirection: TrendDirection | null;
  activeServices: number;
  pendingAcceptance: number;
  completionRatePct: Decimal;
  completionRateFormatted: string;
  asOf: Date;
}

export interface OwnerPropertyCard {
  id: string;
  name: string;
  type: PropertyType;
  addressLine: string;
  unitCount: number;
  occupancyPct: number;
  imageUrl: string | null;
  isActive: boolean;
  hrefDetail: string;
}

export interface OwnerRecentRequest {
  agreementId: string;
  serviceTypeName: string;
  propertyName: string;
  status: OwnerVisibleAgreementStatus;
  statusVariant: StatusVariant;
  ageHuman: string;
  hrefDetail: string;
}

// Runtime Zod schemas — used at service→UI boundary to defend against
// repository return-shape drift.
// Decimal-like (decimal.js or Prisma.Decimal) — both expose toFixed/toString.
const decimalSchema = z.custom<Decimal>(
  (v) => v != null && typeof (v as any).toFixed === 'function' && typeof (v as any).toString === 'function',
  { message: 'Expected Decimal-like value' },
);

export const ownerKpisSchema = z.object({
  totalSpentYtd: decimalSchema,
  totalSpentYtdFormatted: z.string(),
  ytdTrendPct: decimalSchema.nullable(),
  ytdTrendDirection: z.enum(TREND_DIRECTIONS).nullable(),
  activeServices: z.number().int().nonnegative(),
  pendingAcceptance: z.number().int().nonnegative(),
  completionRatePct: decimalSchema,
  completionRateFormatted: z.string(),
  asOf: z.date(),
});

type _AssertKpisParity = z.infer<typeof ownerKpisSchema> extends OwnerKpis
  ? OwnerKpis extends z.infer<typeof ownerKpisSchema> ? true : never
  : never;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _kpisParity: _AssertKpisParity = true;

export const ownerPropertyCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(PropertyType),
  addressLine: z.string(),
  unitCount: z.number().int().nonnegative(),
  occupancyPct: z.number().min(0).max(100),
  imageUrl: z.string().nullable(),
  isActive: z.boolean(),
  hrefDetail: z.string(),
});

type _AssertPropertyCardParity = z.infer<typeof ownerPropertyCardSchema> extends OwnerPropertyCard
  ? OwnerPropertyCard extends z.infer<typeof ownerPropertyCardSchema> ? true : never
  : never;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _propertyCardParity: _AssertPropertyCardParity = true;

export const ownerRecentRequestSchema = z.object({
  agreementId: z.string(),
  serviceTypeName: z.string(),
  propertyName: z.string(),
  status: z.enum(OWNER_VISIBLE_AGREEMENT_STATUSES),
  statusVariant: z.enum(STATUS_VARIANTS),
  ageHuman: z.string(),
  hrefDetail: z.string(),
});

type _AssertRecentRequestParity = z.infer<typeof ownerRecentRequestSchema> extends OwnerRecentRequest
  ? OwnerRecentRequest extends z.infer<typeof ownerRecentRequestSchema> ? true : never
  : never;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _recentRequestParity: _AssertRecentRequestParity = true;
