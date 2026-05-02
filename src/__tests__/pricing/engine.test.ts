import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import {
  calculateQuote,
  calculateQuoteWithMetadata,
  isLockActive,
  createPriceLock,
  validatePricingParams,
} from '@/features/pricing/engine';

describe('Pricing Engine', () => {
  describe('calculateQuote', () => {
    it('should calculate quote correctly with standard inputs', () => {
      const params = {
        basePrice: new Decimal(100),
        locationFactor: 1.0,
        frequencyMultiplier: 1.0,
        unitCount: 5,
      };

      const result = calculateQuote(params);
      expect(result.toNumber()).toBe(500); // 100 * 1.0 * 1.0 * 5 = 500
    });

    it('should apply location factor correctly', () => {
      const params = {
        basePrice: new Decimal(100),
        locationFactor: 0.8, // Suburbs discount
        frequencyMultiplier: 1.0,
        unitCount: 5,
      };

      const result = calculateQuote(params);
      expect(result.toNumber()).toBe(400); // 100 * 0.8 * 1.0 * 5 = 400
    });

    it('should apply frequency multiplier correctly', () => {
      const params = {
        basePrice: new Decimal(100),
        locationFactor: 1.0,
        frequencyMultiplier: 0.9, // Weekly discount
        unitCount: 5,
      };

      const result = calculateQuote(params);
      expect(result.toNumber()).toBe(450); // 100 * 1.0 * 0.9 * 5 = 450
    });

    it('should scale linearly with unit count', () => {
      const params = {
        basePrice: new Decimal(100),
        locationFactor: 1.0,
        frequencyMultiplier: 1.0,
        unitCount: 10,
      };

      const result = calculateQuote(params);
      expect(result.toNumber()).toBe(1000); // 100 * 1.0 * 1.0 * 10 = 1000
    });

    it('should be deterministic (same inputs = same output)', () => {
      const params = {
        basePrice: new Decimal(150.50),
        locationFactor: 1.2,
        frequencyMultiplier: 0.85,
        unitCount: 7,
      };

      const result1 = calculateQuote(params);
      const result2 = calculateQuote(params);
      const result3 = calculateQuote(params);

      expect(result1.toString()).toBe(result2.toString());
      expect(result2.toString()).toBe(result3.toString());
    });

    it('should handle zero units correctly', () => {
      const params = {
        basePrice: new Decimal(100),
        locationFactor: 1.0,
        frequencyMultiplier: 1.0,
        unitCount: 0,
      };

      const result = calculateQuote(params);
      expect(result.toNumber()).toBe(0); // 100 * 1.0 * 1.0 * 0 = 0
    });

    it('should handle high unit count', () => {
      const params = {
        basePrice: new Decimal(100),
        locationFactor: 1.0,
        frequencyMultiplier: 1.0,
        unitCount: 1000,
      };

      const result = calculateQuote(params);
      expect(result.toNumber()).toBe(100000); // 100 * 1.0 * 1.0 * 1000 = 100000
    });

    it('should handle various location factors', () => {
      const locationFactors = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0];
      
      locationFactors.forEach(factor => {
        const params = {
          basePrice: new Decimal(100),
          locationFactor: factor,
          frequencyMultiplier: 1.0,
          unitCount: 1,
        };
        const result = calculateQuote(params);
        expect(result.toNumber()).toBe(100 * factor);
      });
    });
  });

  describe('calculateQuoteWithMetadata', () => {
    it('should return metadata along with calculated price', () => {
      const params = {
        basePrice: new Decimal(100),
        locationFactor: 1.0,
        frequencyMultiplier: 1.0,
        unitCount: 5,
      };

      const result = calculateQuoteWithMetadata(params);
      
      expect(result.quotedPrice.toNumber()).toBe(500);
      expect(result.basePrice.toNumber()).toBe(100);
      expect(result.locationFactor).toBe(1.0);
      expect(result.frequencyMultiplier).toBe(1.0);
      expect(result.unitCount).toBe(5);
      expect(result.calculatedAt).toBeInstanceOf(Date);
    });
  });

  describe('isLockActive', () => {
    it('should return false when priceLockedUntil is null', () => {
      expect(isLockActive(null)).toBe(false);
    });

    it('should return false when lock has expired', () => {
      const expiredDate = new Date();
      expiredDate.setHours(expiredDate.getHours() - 1); // 1 hour ago
      expect(isLockActive(expiredDate)).toBe(false);
    });

    it('should return true when lock is still active', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1); // 1 hour from now
      expect(isLockActive(futureDate)).toBe(true);
    });
  });

  describe('createPriceLock', () => {
    it('should create a new 24-hour lock when no existing lock', () => {
      const lockDate = createPriceLock(null);
      const now = new Date();
      const diffHours = (lockDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      expect(diffHours).toBeGreaterThan(23.9);
      expect(diffHours).toBeLessThan(24.1);
    });

    it('should throw error when existing lock is active', () => {
      const activeLock = new Date();
      activeLock.setHours(activeLock.getHours() + 1); // 1 hour from now

      expect(() => createPriceLock(activeLock)).toThrow('Price lock is active');
    });

    it('should allow creating new lock when existing lock is expired', () => {
      const expiredLock = new Date();
      expiredLock.setHours(expiredLock.getHours() - 1); // 1 hour ago

      const newLock = createPriceLock(expiredLock);
      const now = new Date();
      const diffHours = (newLock.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      expect(diffHours).toBeGreaterThan(23.9);
      expect(diffHours).toBeLessThan(24.1);
    });
  });

  describe('validatePricingParams', () => {
    it('should return no errors for valid params', () => {
      const params = {
        basePrice: new Decimal(100),
        locationFactor: 1.0,
        frequencyMultiplier: 0.9,
        unitCount: 5,
      };

      const errors = validatePricingParams(params);
      expect(errors).toHaveLength(0);
    });

    it('should return error for non-positive basePrice', () => {
      const params = {
        basePrice: new Decimal(0),
        locationFactor: 1.0,
        frequencyMultiplier: 0.9,
        unitCount: 5,
      };

      const errors = validatePricingParams(params);
      expect(errors).toContain('basePrice must be a positive Decimal');
    });

    it('should return error for invalid locationFactor', () => {
      const params = {
        basePrice: new Decimal(100),
        locationFactor: 15, // Too high
        frequencyMultiplier: 0.9,
        unitCount: 5,
      };

      const errors = validatePricingParams(params);
      expect(errors).toContain('locationFactor must be between 0.1 and 10');
    });

    it('should return error for invalid frequencyMultiplier', () => {
      const params = {
        basePrice: new Decimal(100),
        locationFactor: 1.0,
        frequencyMultiplier: 0, // Invalid
        unitCount: 5,
      };

      const errors = validatePricingParams(params);
      expect(errors).toContain('frequencyMultiplier must be between 0.1 and 5');
    });

    it('should return error for invalid unitCount', () => {
      const params = {
        basePrice: new Decimal(100),
        locationFactor: 1.0,
        frequencyMultiplier: 0.9,
        unitCount: -1, // Invalid
      };

      const errors = validatePricingParams(params);
      expect(errors).toContain('unitCount must be a positive integer');
    });

    it('should return multiple errors for multiple invalid params', () => {
      const params = {
        basePrice: new Decimal(0),
        locationFactor: 0,
        frequencyMultiplier: 0,
        unitCount: 0,
      };

      const errors = validatePricingParams(params);
      expect(errors.length).toBeGreaterThan(1);
    });
  });
});
