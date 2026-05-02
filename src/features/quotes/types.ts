import { z } from 'zod';
import Decimal from 'decimal.js';

/**
 * Quote types and schemas for OPSMP Platform
 */

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  QUOTED = 'QUOTED',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
}

export interface Quote {
  id: string;
  ownerId: string;
  propertyId: string;
  serviceTypeId: string;
  quotedPrice: Decimal;
  priceLockedUntil: Date | null;
  status: QuoteStatus;
  createdAt: Date;
  updatedAt: Date;
  property?: Property;
  serviceType?: ServiceType;
  owner?: User;
  agreement?: Agreement;
}

export interface Property {
  id: string;
  name: string;
  encryptedAddress: string;
  zone: string;
  imageUrls: string[];
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  basePrice: Decimal;
}

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Agreement {
  id: string;
  quoteId: string;
  quotedPrice: Decimal;
  status: string;
}

/**
 * Zod schemas for validation
 */
export const CreateQuoteSchema = z.object({
  ownerId: z.string().min(1, 'Owner ID is required'),
  propertyId: z.string().min(1, 'Property ID is required'),
  serviceTypeId: z.string().min(1, 'Service type ID is required'),
  basePrice: z.number().positive('Base price must be positive'),
  locationFactor: z.number().min(0.1, 'Location factor must be at least 0.1').max(10, 'Location factor cannot exceed 10'),
  frequencyMultiplier: z.number().min(0.1, 'Frequency multiplier must be at least 0.1').max(5, 'Frequency multiplier cannot exceed 5'),
  unitCount: z.number().int().positive('Unit count must be a positive integer'),
});

export const UpdateQuoteStatusSchema = z.object({
  quoteId: z.string().min(1, 'Quote ID is required'),
  status: z.enum([QuoteStatus.QUOTED, QuoteStatus.ACCEPTED, QuoteStatus.EXPIRED, QuoteStatus.DRAFT]),
});

export type CreateQuoteInput = z.infer<typeof CreateQuoteSchema>;
export type UpdateQuoteStatusInput = z.infer<typeof UpdateQuoteStatusSchema>;

/**
 * Quote with computed fields for display
 */
export interface QuoteDisplay {
  id: string;
  propertyName: string;
  serviceTypeName: string;
  quotedPrice: string;
  status: QuoteStatus;
  statusBadgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  priceLockedUntil: Date | null;
  isLocked: boolean;
  isExpired: boolean;
  createdAt: Date;
  formattedDate: string;
}
