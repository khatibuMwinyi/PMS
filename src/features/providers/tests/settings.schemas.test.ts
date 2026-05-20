import { describe, it, expect } from 'vitest';
import {
  BusinessProfileSchema,
  CoverageSchema,
  BlockedDateSchema,
} from '../schemas';

describe('BusinessProfileSchema', () => {
  it('accepts valid business name and Tanzania mobile money number', () => {
    const result = BusinessProfileSchema.safeParse({
      businessName: 'Acme Services',
      mobileMoneyNumber: '+255712345678',
    });
    expect(result.success).toBe(true);
  });

  it('accepts null mobileMoneyNumber', () => {
    const result = BusinessProfileSchema.safeParse({
      businessName: 'Acme',
      mobileMoneyNumber: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects business name shorter than 2 chars', () => {
    const result = BusinessProfileSchema.safeParse({
      businessName: 'A',
      mobileMoneyNumber: null,
    });
    expect(result.success).toBe(false);
  });

  it('rejects business name longer than 80 chars', () => {
    const result = BusinessProfileSchema.safeParse({
      businessName: 'x'.repeat(81),
      mobileMoneyNumber: null,
    });
    expect(result.success).toBe(false);
  });

  it('rejects mobile money number not matching +255XXXXXXXXX', () => {
    const result = BusinessProfileSchema.safeParse({
      businessName: 'Acme',
      mobileMoneyNumber: '0712345678',
    });
    expect(result.success).toBe(false);
  });
});

describe('CoverageSchema', () => {
  it('accepts 1-8 categories and radius 5-30', () => {
    const result = CoverageSchema.safeParse({
      serviceCategories: ['CLEANING'],
      serviceRadiusKm: 10,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty serviceCategories', () => {
    const result = CoverageSchema.safeParse({
      serviceCategories: [],
      serviceRadiusKm: 10,
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 8 categories', () => {
    const result = CoverageSchema.safeParse({
      serviceCategories: Array.from({ length: 9 }, (_, i) => `C${i}`),
      serviceRadiusKm: 10,
    });
    expect(result.success).toBe(false);
  });

  it('rejects radius below 5', () => {
    const result = CoverageSchema.safeParse({
      serviceCategories: ['CLEANING'],
      serviceRadiusKm: 4,
    });
    expect(result.success).toBe(false);
  });

  it('rejects radius above 30', () => {
    const result = CoverageSchema.safeParse({
      serviceCategories: ['CLEANING'],
      serviceRadiusKm: 31,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer radius', () => {
    const result = CoverageSchema.safeParse({
      serviceCategories: ['CLEANING'],
      serviceRadiusKm: 10.5,
    });
    expect(result.success).toBe(false);
  });
});

describe('BlockedDateSchema', () => {
  it('accepts ISO date string >= today', () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const result = BlockedDateSchema.safeParse({ date: tomorrow });
    expect(result.success).toBe(true);
  });

  it('rejects past date', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const result = BlockedDateSchema.safeParse({ date: yesterday });
    expect(result.success).toBe(false);
  });

  it('rejects malformed date', () => {
    const result = BlockedDateSchema.safeParse({ date: 'not-a-date' });
    expect(result.success).toBe(false);
  });
});
