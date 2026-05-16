// src/features/dashboard/schemas/owner-dashboard.schema.ts
import { z } from 'zod';
import Decimal from 'decimal.js';
import { PropertyType } from '@prisma/client';

export type OwnerVisibleAgreementStatus =
  | 'PENDING_ASSIGNMENT'
  | 'PENDING_ACCEPTANCE'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'CANCELLED';

export type StatusVariant = 'urgent' | 'progress' | 'scheduled' | 'complete' | 'neutral';
export type TrendDirection = 'up' | 'down' | 'flat';

export interface OwnerKpis {
  totalSpentYtd: Decimal;
  totalSpentYtdFormatted: string;
  ytdTrendPct: Decimal | null;
  ytdTrendDirection: TrendDirection | null;
  activeWorkOrders: number;
  pendingAcceptance: number;
  maintenanceRoiPct: Decimal;
  maintenanceRoiFormatted: string;
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
// repository return-shape drift. Decimal validated as string then rehydrated.
const decimalSchema = z.instanceof(Decimal);

export const ownerKpisSchema = z.object({
  totalSpentYtd: decimalSchema,
  totalSpentYtdFormatted: z.string(),
  ytdTrendPct: decimalSchema.nullable(),
  ytdTrendDirection: z.enum(['up', 'down', 'flat']).nullable(),
  activeWorkOrders: z.number().int().nonnegative(),
  pendingAcceptance: z.number().int().nonnegative(),
  maintenanceRoiPct: decimalSchema,
  maintenanceRoiFormatted: z.string(),
  asOf: z.date(),
});

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

export const ownerRecentRequestSchema = z.object({
  agreementId: z.string(),
  serviceTypeName: z.string(),
  propertyName: z.string(),
  status: z.enum([
    'PENDING_ASSIGNMENT', 'PENDING_ACCEPTANCE', 'SCHEDULED',
    'IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'CANCELLED',
  ]),
  statusVariant: z.enum(['urgent', 'progress', 'scheduled', 'complete', 'neutral']),
  ageHuman: z.string(),
  hrefDetail: z.string(),
});
