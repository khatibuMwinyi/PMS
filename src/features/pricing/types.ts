import { z } from 'zod';
import Decimal from 'decimal.js';

/**
 * Pricing rule types for the OPSMP platform
 */

export interface PricingParams {
  basePrice: Decimal;
  locationFactor: number;  // e.g., 1.0 for city center, 0.8 for suburbs
  frequencyMultiplier: number; // e.g., 1.0 for one-time, 0.9 for weekly
  unitCount: number;
}

export interface QuoteCalculationResult {
  quotedPrice: Decimal;
  basePrice: Decimal;
  locationFactor: number;
  frequencyMultiplier: number;
  unitCount: number;
  calculatedAt: Date;
}

export interface PriceLockParams {
  quoteId: string;
  lockedUntil: Date;
}

export const QuoteSchema = z.object({
  id: z.string().cuid(),
  ownerId: z.string(),
  propertyId: z.string(),
  serviceTypeId: z.string(),
  quotedPrice: z.instanceof(Decimal).or(z.number()),
  priceLockedUntil: z.date().nullable(),
  status: z.enum(['DRAFT', 'QUOTED', 'ACCEPTED', 'EXPIRED']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Quote = z.infer<typeof QuoteSchema>;

export const CreateQuoteSchema = z.object({
  ownerId: z.string(),
  propertyId: z.string(),
  serviceTypeId: z.string(),
  basePrice: z.number().positive(),
  locationFactor: z.number().min(0.1).max(10),
  frequencyMultiplier: z.number().min(0.1).max(5),
  unitCount: z.number().int().positive(),
});

export type CreateQuoteInput = z.infer<typeof CreateQuoteSchema>;
