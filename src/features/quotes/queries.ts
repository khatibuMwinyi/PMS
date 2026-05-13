'use server';

import { prisma } from '@/core/database/client';
import { quoteRepository } from './repositories';
import { QuoteStatus } from './types';
import Decimal from 'decimal.js';

export async function getQuoteById(quoteId: string) {
  return quoteRepository.findById(quoteId);
}

export async function listQuotesByOwner(ownerId: string) {
  const quotes = await quoteRepository.findByOwner(ownerId);
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
    formattedDate: quote.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    statusBadgeVariant: getStatusBadgeVariant(quote.status),
  }));
}

export async function listQuotesByStatus(status: string) {
  return quoteRepository.findByStatus(status);
}

export async function getQuoteStats() {
  const [totalQuotes, quotedCount, acceptedCount, expiredCount, draftCount] = await Promise.all([
    prisma.quote.count(),
    prisma.quote.count({ where: { status: QuoteStatus.QUOTED } }),
    prisma.quote.count({ where: { status: QuoteStatus.ACCEPTED } }),
    prisma.quote.count({ where: { status: QuoteStatus.EXPIRED } }),
    prisma.quote.count({ where: { status: QuoteStatus.DRAFT } }),
  ]);
  return { totalQuotes, quotedCount, acceptedCount, expiredCount, draftCount };
}

export async function isQuoteLockActive(quoteId: string): Promise<boolean> {
  const quote = await quoteRepository.findById(quoteId);
  if (!quote || !quote.priceLockedUntil) return false;
  return new Date() < quote.priceLockedUntil;
}

export async function getExpiredQuotes() {
  return quoteRepository.findExpired();
}

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case QuoteStatus.QUOTED: return 'default';
    case QuoteStatus.ACCEPTED: return 'secondary';
    case QuoteStatus.EXPIRED: return 'outline';
    case QuoteStatus.DRAFT: return 'outline';
    default: return 'outline';
  }
}