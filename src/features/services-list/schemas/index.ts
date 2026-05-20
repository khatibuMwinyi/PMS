import { z } from 'zod';
import type { AgreementStatus, AssignmentStatus } from '@prisma/client';

export const OWNER_SERVICE_STATUSES = [
  'PENDING_ASSIGNMENT',
  'PENDING_ACCEPTANCE',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'DISPUTED',
  'CANCELLED',
] as const;

export type OwnerServiceStatus = typeof OWNER_SERVICE_STATUSES[number];

export interface OwnerServiceKpis {
  activeCount: number;
  scheduledCount: number;
  inProgressCount: number;
  disputedCount: number;
}

export interface OwnerServiceListResult {
  rows: OwnerServiceRow[];
  total: number;
}

export interface OwnerServiceRow {
  agreementId: string;
  shortRef: string;
  propertyName: string;
  serviceTypeName: string;
  status: OwnerServiceStatus;
  createdAt: Date;
  formattedDate: string;
  hrefDetail: string;
}

export interface RawServiceRow {
  agreementId: string;
  propertyName: string;
  serviceTypeName: string;
  agreementStatus: AgreementStatus;
  assignmentStatus: AssignmentStatus | null;
  createdAt: Date;
}

export const ownerServiceKpisSchema = z.object({
  activeCount: z.number().int().nonnegative(),
  scheduledCount: z.number().int().nonnegative(),
  inProgressCount: z.number().int().nonnegative(),
  disputedCount: z.number().int().nonnegative(),
});
