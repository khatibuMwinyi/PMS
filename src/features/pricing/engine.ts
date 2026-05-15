import Decimal from 'decimal.js';

/**
 * Pricing Engine for OPSMP Platform
 * 
 * Quote Calculation: quote = basePrice × locationFactor × frequencyMultiplier × unitCount
 * 
 * All calculations use Decimal.js for precision with currency values.
 */

export interface PricingParams {
  basePrice: Decimal;
  locationFactor: number;  // e.g., 1.0 for city center, 0.8 for suburbs
  frequencyMultiplier: number; // e.g., 1.0 for one-time, 0.9 for weekly
  unitCount: number;
}

export interface QuoteResult {
  quotedPrice: Decimal;
  basePrice: Decimal;
  locationFactor: number;
  frequencyMultiplier: number;
  unitCount: number;
  calculatedAt: Date;
}

/**
 * Calculate quote price using the pricing engine formula
 * Result is deterministic: same inputs always produce same output
 */
export function calculateQuote(params: PricingParams): Decimal {
  return params.basePrice
    .times(params.locationFactor)
    .times(params.frequencyMultiplier)
    .times(params.unitCount);
}

/**
 * Calculate quote with full result metadata
 */
export function calculateQuoteWithMetadata(params: PricingParams): QuoteResult {
  const quotedPrice = calculateQuote(params);
  
  return {
    quotedPrice,
    basePrice: params.basePrice,
    locationFactor: params.locationFactor,
    frequencyMultiplier: params.frequencyMultiplier,
    unitCount: params.unitCount,
    calculatedAt: new Date(),
  };
}

/**
 * Check if a price lock is still valid
 */
export function isLockActive(priceLockedUntil: Date | null): boolean {
  if (!priceLockedUntil) return false;
  return new Date() < priceLockedUntil;
}

/**
 * Create a new price lock timestamp (24 hours from now)
 */
export function createPriceLock(existingLock?: Date | null | undefined): Date {
  // If there's an existing active lock, throw error (recalculation guard)
  if (isLockActive(existingLock ?? null)) {
    throw new Error('Price lock is active. Cannot recalculate until lock expires.');
  }
  
  const lockUntil = new Date();
  lockUntil.setHours(lockUntil.getHours() + 24);
  return lockUntil;
}

/**
 * Validate pricing inputs
 */
export function validatePricingParams(params: Partial<PricingParams>): string[] {
  const errors: string[] = [];
  
  if (!params.basePrice || params.basePrice.lte(0)) {
    errors.push('basePrice must be a positive Decimal');
  }
  if (!params.locationFactor || params.locationFactor <= 0 || params.locationFactor > 10) {
    errors.push('locationFactor must be between 0.1 and 10');
  }
  if (!params.frequencyMultiplier || params.frequencyMultiplier <= 0 || params.frequencyMultiplier > 5) {
    errors.push('frequencyMultiplier must be between 0.1 and 5');
  }
  if (!params.unitCount || params.unitCount <= 0 || !Number.isInteger(params.unitCount)) {
    errors.push('unitCount must be a positive integer');
  }
  
  return errors;
}
