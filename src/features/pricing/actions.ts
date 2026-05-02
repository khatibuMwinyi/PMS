import { prisma } from '@/core/database/client';
import Decimal from 'decimal.js';
import { calculateQuote, createPriceLock, isLockActive } from './engine';
import { validatePricingParams } from './engine';
import { CreateQuoteSchema } from './types';

/**
 * Pricing Server Actions for OPSMP Platform
 * 
 * Handles quote creation with pricing engine integration and price locking.
 */

export interface CreateQuoteParams {
  ownerId: string;
  propertyId: string;
  serviceTypeId: string;
  basePrice: number;
  locationFactor: number;
  frequencyMultiplier: number;
  unitCount: number;
}

export interface QuoteResult {
  id: string;
  quotedPrice: Decimal;
  priceLockedUntil: Date | null;
  status: string;
}

/**
 * Create a quote with pricing engine calculation and 24-hour price lock
 */
export async function createQuoteWithPricing(params: CreateQuoteParams): Promise<QuoteResult> {
  // Validate inputs using Zod schema
  const validation = CreateQuoteSchema.safeParse(params);
  if (!validation.success) {
    throw new Error(`Invalid quote parameters: ${validation.error.message}`);
  }

  // Validate pricing parameters
  const pricingErrors = validatePricingParams({
    basePrice: new Decimal(params.basePrice),
    locationFactor: params.locationFactor,
    frequencyMultiplier: params.frequencyMultiplier,
    unitCount: params.unitCount,
  });
  if (pricingErrors.length > 0) {
    throw new Error(`Pricing validation failed: ${pricingErrors.join(', ')}`);
  }

  // Calculate quote using pricing engine
  const quotedPrice = calculateQuote({
    basePrice: new Decimal(params.basePrice),
    locationFactor: params.locationFactor,
    frequencyMultiplier: params.frequencyMultiplier,
    unitCount: params.unitCount,
  });

  // Create 24-hour price lock
  const priceLockedUntil = createPriceLock(null); // No existing lock on creation

  // Save quote to database
  const quote = await prisma.quote.create({
    data: {
      ownerId: params.ownerId,
      propertyId: params.propertyId,
      serviceTypeId: params.serviceTypeId,
      quotedPrice: quotedPrice.toNumber(),
      priceLockedUntil: priceLockedUntil,
      status: 'QUOTED',
    },
  });

  return {
    id: quote.id,
    quotedPrice,
    priceLockedUntil: quote.priceLockedUntil,
    status: quote.status,
  };
}

/**
 * Recalculate quote price (only if lock is not active)
 */
export async function recalculateQuote(
  quoteId: string,
  params: CreateQuoteParams
): Promise<Decimal> {
  const existingQuote = await prisma.quote.findUnique({
    where: { id: quoteId },
  });

  if (!existingQuote) {
    throw new Error('Quote not found');
  }

  // Guard: reject if lock is active
  if (isLockActive(existingQuote.priceLockedUntil)) {
    throw new Error('Price lock is active. Cannot recalculate until lock expires.');
  }

  // Recalculate with new parameters
  const newPrice = calculateQuote({
    basePrice: new Decimal(params.basePrice),
    locationFactor: params.locationFactor,
    frequencyMultiplier: params.frequencyMultiplier,
    unitCount: params.unitCount,
  });

  // Update quote
  await prisma.quote.update({
    where: { id: quoteId },
    data: {
      quotedPrice: newPrice.toNumber(),
      priceLockedUntil: createPriceLock(), // New 24-hour lock
    },
  });

  return newPrice;
}

/**
 * Get quote by ID
 */
export async function getQuote(quoteId: string) {
  return prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      property: true,
      serviceType: true,
      owner: true,
    },
  });
}

/**
 * List quotes for an owner (scoped by ownerId)
 */
export async function listQuotesByOwner(ownerId: string) {
  return prisma.quote.findMany({
    where: { ownerId },
    include: {
      property: true,
      serviceType: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Accept a quote (transitions status to ACCEPTED)
 */
export async function acceptQuote(quoteId: string): Promise<void> {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
  });

  if (!quote) {
    throw new Error('Quote not found');
  }

  if (quote.status !== 'QUOTED') {
    throw new Error(`Quote cannot be accepted. Current status: ${quote.status}`);
  }

  // Check if quote is expired
  if (quote.priceLockedUntil && new Date() > quote.priceLockedUntil) {
    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: 'EXPIRED' },
    });
    throw new Error('Quote has expired');
  }

  await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'ACCEPTED' },
  });
}

/**
 * Expire quotes that have passed their lock time
 */
export async function expireOldQuotes(): Promise<number> {
  const result = await prisma.quote.updateMany({
    where: {
      status: 'QUOTED',
      priceLockedUntil: {
        lt: new Date(),
      },
    },
    data: {
      status: 'EXPIRED',
    },
  });

  return result.count;
}
