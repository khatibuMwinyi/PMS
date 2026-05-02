import { z } from 'zod';
import Decimal from 'decimal.js';

/**
 * Agreement types and schemas for OPSMP Platform
 */

export enum AgreementStatus {
  QUOTED = 'QUOTED',
  PENDING_ASSIGNMENT = 'PENDING_ASSIGNMENT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Agreement {
  id: string;
  quoteId: string;
  quotedPrice: Decimal;
  status: AgreementStatus;
  createdAt: Date;
  updatedAt: Date;
  quote?: Quote;
  property?: Property;
  owner?: User;
}

export interface Quote {
  id: string;
  quotedPrice: Decimal;
  status: string;
}

export interface Property {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
}

/**
 * Zod schemas for validation
 */
export const CreateAgreementSchema = z.object({
  quoteId: z.string().min(1, 'Quote ID is required'),
  ownerId: z.string().min(1, 'Owner ID is required'),
  propertyId: z.string().min(1, 'Property ID is required'),
  quotedPrice: z.number().positive('Quoted price must be positive'),
});

export const UpdateAgreementStatusSchema = z.object({
  agreementId: z.string().min(1, 'Agreement ID is required'),
  status: z.enum([
    AgreementStatus.QUOTED,
    AgreementStatus.PENDING_ASSIGNMENT,
    AgreementStatus.ACTIVE,
    AgreementStatus.COMPLETED,
    AgreementStatus.CANCELLED,
  ]),
});

export type CreateAgreementInput = z.infer<typeof CreateAgreementSchema>;
export type UpdateAgreementStatusInput = z.infer<typeof UpdateAgreementStatusSchema>;

/**
 * Agreement with computed fields for display
 */
export interface AgreementDisplay {
  id: string;
  quotedPrice: string;
  status: AgreementStatus;
  statusBadgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  createdAt: Date;
  formattedDate: string;
  propertyName?: string;
  quoteId: string;
  isImmutable: boolean;
}
