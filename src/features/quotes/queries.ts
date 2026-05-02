import { prisma } from '@/core/database/client';
import Decimal from 'decimal.js';
import { QuoteStatus } from './types';

/**
 * Quote Queries for OPSMP Platform
 * 
 * Query functions for quotes with proper scoping and filtering.
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
      owner: {
        select: { id: true, email: true, role: true },
      },
      agreement: true,
    },
  });
}

/**
 * List quotes for a specific owner (scoped by ownerId)
 * This is the main query for the owner quote list view
 */
export async function listQuotesByOwner(ownerId: string) {
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
    propertyZone: quote.property.zone,
    serviceTypeName: quote.serviceType.name,
    quotedPrice: new Decimal(quote.quotedPrice),
    status: quote.status,
    priceLockedUntil: quote.priceLockedUntil,
    isLocked: quote.priceLockedUntil ? new Date() < quote.priceLockedUntil : false,
    isExpired: quote.priceLockedUntil ? new Date() > quote.priceLockedUntil : false,
    createdAt: quote.createdAt,
    formattedDate: quote.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    statusBadgeVariant: getStatusBadgeVariant(quote.status),
  }));
}

/**
 * List quotes by status (for admin view)
 */
export async function listQuotesByStatus(status: string) {
  return prisma.quote.findMany({
    where: { status },
    include: {
      property: {
        select: { id: true, name: true },
      },
      serviceType: {
        select: { id: true, name: true },
      },
      owner: {
        select: { id: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get quote statistics (for admin dashboard)
 */
export async function getQuoteStats() {
  const [
    totalQuotes,
    quotedCount,
    acceptedCount,
    expiredCount,
    draftCount,
  ] = await Promise.all([
    prisma.quote.count(),
    prisma.quote.count({ where: { status: QuoteStatus.QUOTED } }),
    prisma.quote.count({ where: { status: QuoteStatus.ACCEPTED } }),
    prisma.quote.count({ where: { status: QuoteStatus.EXPIRED } }),
    prisma.quote.count({ where: { status: QuoteStatus.DRAFT } }),
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
 * Get quotes with expired locks that need status update
 */
export async function getExpiredQuotes() {
  return prisma.quote.findMany({
    where: {
      status: QuoteStatus.QUOTED,
      priceLockedUntil: {
        lt: new Date(),
      },
    },
  });
}

/**
 * Helper: Get badge variant based on quote status
 */
function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case QuoteStatus.QUOTED:
      return 'default'; // blue
    case QuoteStatus.ACCEPTED:
      return 'secondary'; // green
    case QuoteStatus.EXPIRED:
      return 'outline'; // gray
    case QuoteStatus.DRAFT:
      return 'outline'; // light
    default:
      return 'outline';
  }
}
