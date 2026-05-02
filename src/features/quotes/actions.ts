import { prisma } from '@/core/database/client';
import Decimal from 'decimal.js';
import { QuoteStatus, CreateQuoteSchema, UpdateQuoteStatusSchema } from './types';
import { calculateQuote, createPriceLock, isLockActive } from '@/features/pricing/engine';
import { validatePricingParams } from '@/features/pricing/engine';

/**
 * Quote Server Actions for OPSMP Platform
 * 
 * Handles quote request flow, status updates, and integration with pricing engine.
 */

export interface RequestQuoteParams {
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
  propertyName: string;
  serviceTypeName: string;
}

/**
 * Request a quote: owner selects property + service type, pricing engine calculates
 */
export async function requestQuote(params: RequestQuoteParams): Promise<QuoteResult> {
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
  const priceLockedUntil = createPriceLock(null);

  // Get property and service type names for response
  const [property, serviceType] = await Promise.all([
    prisma.property.findUnique({
      where: { id: params.propertyId },
      select: { name: true },
    }),
    prisma.serviceType.findUnique({
      where: { id: params.serviceTypeId },
      select: { name: true },
    }),
  ]);

  if (!property) throw new Error('Property not found');
  if (!serviceType) throw new Error('Service type not found');

  // Save quote to database
  const quote = await prisma.quote.create({
    data: {
      ownerId: params.ownerId,
      propertyId: params.propertyId,
      serviceTypeId: params.serviceTypeId,
      quotedPrice: quotedPrice.toNumber(),
      priceLockedUntil,
      status: QuoteStatus.QUOTED,
    },
  });

  return {
    id: quote.id,
    quotedPrice,
    priceLockedUntil: quote.priceLockedUntil,
    status: quote.status,
    propertyName: property.name,
    serviceTypeName: serviceType.name,
  };
}

/**
 * List quotes for an owner (scoped by ownerId)
 */
export async function listOwnerQuotes(ownerId: string) {
  const quotes = await prisma.quote.findMany({
    where: { ownerId },
    include: {
      property: {
        select: { id: true, name: true, zone: true },
      },
      serviceType: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return quotes.map(quote => ({
    id: quote.id,
    propertyName: quote.property.name,
    serviceTypeName: quote.serviceType.name,
    quotedPrice: new Decimal(quote.quotedPrice),
    status: quote.status,
    priceLockedUntil: quote.priceLockedUntil,
    isLocked: isLockActive(quote.priceLockedUntil),
    isExpired: quote.priceLockedUntil ? new Date() > quote.priceLockedUntil : false,
    createdAt: quote.createdAt,
    formattedDate: quote.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  }));
}

/**
 * Get quote details by ID
 */
export async function getQuoteDetails(quoteId: string) {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      property: true,
      serviceType: true,
      owner: {
        select: { id: true, email: true },
      },
      agreement: true,
    },
  });

  if (!quote) return null;

  return {
    ...quote,
    quotedPrice: new Decimal(quote.quotedPrice),
    isLocked: isLockActive(quote.priceLockedUntil),
    isExpired: quote.priceLockedUntil ? new Date() > quote.priceLockedUntil : false,
  };
}

/**
 * Accept a quote: transitions status to ACCEPTED
 */
export async function acceptQuote(quoteId: string): Promise<void> {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
  });

  if (!quote) {
    throw new Error('Quote not found');
  }

  if (quote.status !== QuoteStatus.QUOTED) {
    throw new Error(`Quote cannot be accepted. Current status: ${quote.status}`);
  }

  // Check if quote is expired
  if (quote.priceLockedUntil && new Date() > quote.priceLockedUntil) {
    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: QuoteStatus.EXPIRED },
    });
    throw new Error('Quote has expired');
  }

  // Update status to ACCEPTED
  await prisma.quote.update({
    where: { id: quoteId },
    data: { 
      status: QuoteStatus.ACCEPTED,
      updatedAt: new Date(),
    },
  });
}

/**
 * Update quote status (internal use)
 */
export async function updateQuoteStatus(quoteId: string, status: QuoteStatus): Promise<void> {
  const validation = UpdateQuoteStatusSchema.safeParse({ quoteId, status });
  if (!validation.success) {
    throw new Error(`Invalid status update: ${validation.error.message}`);
  }

  await prisma.quote.update({
    where: { id: quoteId },
    data: { 
      status,
      updatedAt: new Date(),
    },
  });
}

/**
 * Expire old quotes that have passed their lock time
 */
export async function expireOldQuotes(): Promise<number> {
  const result = await prisma.quote.updateMany({
    where: {
      status: QuoteStatus.QUOTED,
      priceLockedUntil: {
        lt: new Date(),
      },
    },
    data: {
      status: QuoteStatus.EXPIRED,
      updatedAt: new Date(),
    },
  });

  return result.count;
}

/**
 * Get quote with price breakdown for display
 */
export async function getQuoteWithBreakdown(quoteId: string) {
  const quote = await getQuoteDetails(quoteId);
  
  if (!quote) return null;

  // Calculate breakdown (this would use stored parameters in a real system)
  // For now, we return the quoted price with metadata
  return {
    ...quote,
    breakdown: {
      basePrice: quote.quotedPrice,
      locationFactor: 1.0, // Would be stored in a real system
      frequencyMultiplier: 1.0,
      unitCount: 1,
      calculatedPrice: quote.quotedPrice,
    },
  };
}
