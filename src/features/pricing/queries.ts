import { prisma } from '@/core/database/client';
import Decimal from 'decimal.js';

/**
 * Pricing Queries for OPSMP Platform
 * 
 * Query functions for quotes and pricing data.
 */

/**
 * Get quote by ID with related data
 */
export async function getQuoteById(quoteId: string) {
  return prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      property: true,
      serviceType: true,
      owner: true,
      agreement: true,
    },
  });
}

/**
 * List all quotes for a specific owner (scoped by ownerId)
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
 * List quotes by status
 */
export async function listQuotesByStatus(status: string) {
  return prisma.quote.findMany({
    where: { status },
    include: {
      property: true,
      serviceType: true,
      owner: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get quote with price lock status
 */
export async function getQuoteWithLockStatus(quoteId: string) {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
  });

  if (!quote) return null;

  const isLocked = quote.priceLockedUntil && new Date() < quote.priceLockedUntil;
  
  return {
    ...quote,
    isLocked,
    lockedUntil: quote.priceLockedUntil,
  };
}

/**
 * Check if a quote's price lock is active
 */
export async function isQuoteLockActive(quoteId: string): Promise<boolean> {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    select: { priceLockedUntil: true },
  });

  if (!quote || !quote.priceLockedUntil) return false;
  return new Date() < quote.priceLockedUntil;
}

/**
 * Get pricing statistics (for admin dashboard)
 */
export async function getPricingStats() {
  const [
    totalQuotes,
    quotedCount,
    acceptedCount,
    expiredCount,
    draftCount,
  ] = await Promise.all([
    prisma.quote.count(),
    prisma.quote.count({ where: { status: 'QUOTED' } }),
    prisma.quote.count({ where: { status: 'ACCEPTED' } }),
    prisma.quote.count({ where: { status: 'EXPIRED' } }),
    prisma.quote.count({ where: { status: 'DRAFT' } }),
  ]);

  return {
    totalQuotes,
    quotedCount,
    acceptedCount,
    expiredCount,
    draftCount,
  };
}

/**
 * Calculate quote price without saving (for preview)
 */
export function calculateQuotePreview(params: {
  basePrice: number;
  locationFactor: number;
  frequencyMultiplier: number;
  unitCount: number;
}): Decimal {
  const basePrice = new Decimal(params.basePrice);
  return basePrice
    .times(params.locationFactor)
    .times(params.frequencyMultiplier)
    .times(params.unitCount);
}
