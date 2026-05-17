import Decimal from 'decimal.js';
import { formatTZS, formatTZSShort } from './currency';

describe('formatTZS', () => {
  it('formats integer numbers with TZS prefix and thousand separators', () => {
    expect(formatTZS(50000)).toBe('TZS 50,000');
  });
  it('formats Decimal input', () => {
    expect(formatTZS(new Decimal('2450.5'))).toBe('TZS 2,450.50');
  });
  it('omits decimals when zero fractional', () => {
    expect(formatTZS(120000)).toBe('TZS 120,000');
  });
  it('shows two decimals when non-zero', () => {
    expect(formatTZS(120000.25)).toBe('TZS 120,000.25');
  });
  it('handles negative amounts', () => {
    expect(formatTZS(-50)).toBe('-TZS 50');
  });
  it('accepts string input', () => {
    expect(formatTZS('1234.5')).toBe('TZS 1,234.50');
  });
});

describe('formatTZSShort', () => {
  it('returns k for thousands', () => {
    expect(formatTZSShort(50_000)).toBe('TZS 50k');
  });
  it('returns M for millions', () => {
    expect(formatTZSShort(2_450_000)).toBe('TZS 2.45M');
  });
  it('returns plain value below 1k', () => {
    expect(formatTZSShort(450)).toBe('TZS 450');
  });
  it('formats Decimal input', () => {
    expect(formatTZSShort(new Decimal('2450000'))).toBe('TZS 2.45M');
  });
  it('handles negative thousands', () => {
    expect(formatTZSShort(-50_000)).toBe('-TZS 50k');
  });
  it('handles negative millions', () => {
    expect(formatTZSShort(-2_450_000)).toBe('-TZS 2.45M');
  });
  it('preserves precision in thousands (no rounding to next 1k)', () => {
    expect(formatTZSShort(1500)).toBe('TZS 1.5k');
  });
  it('formats 999 without k suffix', () => {
    expect(formatTZSShort(999)).toBe('TZS 999');
  });
  it('formats 1000 with k suffix', () => {
    expect(formatTZSShort(1000)).toBe('TZS 1k');
  });
});
