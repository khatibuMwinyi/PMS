import { prisma } from '@/core/database/client';
import { quoteRepository } from '../repositories';
import { calculateQuote, createPriceLock } from '@/features/pricing/engine';
import { validatePricingParams } from '@/features/pricing/engine';
import { fireQuoteRequestedEvent, fireQuoteAcceptedEvent } from '@/core/events';
import { QuoteStatus, CreateQuoteSchema } from '../types';

export class QuoteService {
  static async requestQuote(params: {
    ownerId: string;
    propertyId: string;
    serviceTypeId: string;
    basePrice: number;
    locationFactor: number;
    frequencyMultiplier: number;
    unitCount: number;
  }) {
    const validation = CreateQuoteSchema.safeParse(params);
    if (!validation.success) {
      throw new Error(`Invalid quote parameters: ${validation.error.message}`);
    }

    const pricingErrors = validatePricingParams({
      basePrice: params.basePrice as any,
      locationFactor: params.locationFactor,
      frequencyMultiplier: params.frequencyMultiplier,
      unitCount: params.unitCount,
    });
    if (pricingErrors.length > 0) {
      throw new Error(`Pricing validation failed: ${pricingErrors.join(', ')}`);
    }

    const quotedPrice = calculateQuote({
      basePrice: params.basePrice as any,
      locationFactor: params.locationFactor,
      frequencyMultiplier: params.frequencyMultiplier,
      unitCount: params.unitCount,
    });

    const priceLockedUntil = createPriceLock(null);

    const [property, serviceType] = await Promise.all([
      prisma.property.findUnique({ where: { id: params.propertyId }, select: { name: true } }),
      prisma.serviceType.findUnique({ where: { id: params.serviceTypeId }, select: { name: true } }),
    ]);

    if (!property) throw new Error('Property not found');
    if (!serviceType) throw new Error('Service type not found');

    const quote = await quoteRepository.create({
      ownerId: params.ownerId,
      propertyId: params.propertyId,
      serviceTypeId: params.serviceTypeId,
      quotedPrice: quotedPrice.toNumber(),
      priceLockedUntil,
      status: QuoteStatus.QUOTED,
    });

    await fireQuoteRequestedEvent({
      userId: params.ownerId,
      quoteId: quote.id,
      propertyName: property.name,
      serviceType: serviceType.name,
      quotedPrice: quotedPrice.toNumber(),
    });

    return { id: quote.id, quotedPrice, priceLockedUntil: quote.priceLockedUntil, status: quote.status, propertyName: property.name, serviceTypeName: serviceType.name };
  }

  static async acceptQuote(quoteId: string) {
    const quote = await quoteRepository.findById(quoteId);
    if (!quote) throw new Error('Quote not found');
    if (quote.status !== QuoteStatus.QUOTED) throw new Error(`Quote cannot be accepted. Current status: ${quote.status}`);
    if (quote.priceLockedUntil && new Date() > quote.priceLockedUntil) {
      await quoteRepository.updateStatus(quoteId, QuoteStatus.EXPIRED);
      throw new Error('Quote has expired');
    }

    await quoteRepository.updateStatus(quoteId, QuoteStatus.ACCEPTED);
    await fireQuoteAcceptedEvent({
      userId: quote.ownerId,
      quoteId: quote.id,
      quotedPrice: Number(quote.quotedPrice),
    });
  }

  static async expireOldQuotes() {
    const expired = await quoteRepository.findExpired();
    if (expired.length > 0) {
      await quoteRepository.expireMany(expired.map(q => q.id));
    }
    return expired.length;
  }
}

export const quoteService = QuoteService;