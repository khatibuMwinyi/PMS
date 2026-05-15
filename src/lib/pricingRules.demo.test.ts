import { describe, it, expect } from 'vitest';
import { calculateDemoQuote } from './pricingRules.demo';

describe('calculateDemoQuote', () => {
  it('returns null when service is missing', () => {
    expect(calculateDemoQuote({ service: '', units: 1, frequency: 'weekly', region: 'dar' })).toBeNull();
  });

  it('scales linearly with units', () => {
    const a = calculateDemoQuote({ service: 'cleaning', units: 1, frequency: 'weekly', region: 'dar' })!;
    const b = calculateDemoQuote({ service: 'cleaning', units: 5, frequency: 'weekly', region: 'dar' })!;
    expect(b.amount).toBe(a.amount * 5);
  });

  it('applies frequency multiplier (monthly < weekly)', () => {
    const weekly  = calculateDemoQuote({ service: 'cleaning', units: 1, frequency: 'weekly',  region: 'dar' })!;
    const monthly = calculateDemoQuote({ service: 'cleaning', units: 1, frequency: 'monthly', region: 'dar' })!;
    expect(monthly.amount).toBeLessThan(weekly.amount);
  });

  it('applies regional factor (Zanzibar > Dar)', () => {
    const dar      = calculateDemoQuote({ service: 'cleaning', units: 1, frequency: 'weekly', region: 'dar'      })!;
    const zanzibar = calculateDemoQuote({ service: 'cleaning', units: 1, frequency: 'weekly', region: 'zanzibar' })!;
    expect(zanzibar.amount).toBeGreaterThan(dar.amount);
  });

  it('returns TZS currency', () => {
    const q = calculateDemoQuote({ service: 'cleaning', units: 1, frequency: 'weekly', region: 'dar' })!;
    expect(q.currency).toBe('TZS');
  });
});
