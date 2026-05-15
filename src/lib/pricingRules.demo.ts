export type Frequency = 'weekly' | 'biweekly' | 'monthly';
export type Region    = 'dar' | 'arusha' | 'mwanza' | 'zanzibar' | 'other';

export interface QuoteInput {
  service:   string;
  units:     number;
  frequency: Frequency;
  region:    Region;
}

export interface Quote {
  amount:   number;
  currency: 'TZS';
}

const BASE_PRICES: Record<string, number> = {
  cleaning:    18000,
  plumbing:    22000,
  electrical:  25000,
  landscaping: 35000,
  security:    120000,
  pool:        45000,
};

const FREQUENCY_MULTIPLIER: Record<Frequency, number> = {
  weekly:   4,
  biweekly: 2,
  monthly:  1,
};

const REGION_FACTOR: Record<Region, number> = {
  dar:      1.00,
  arusha:   1.05,
  mwanza:   1.08,
  zanzibar: 1.15,
  other:    1.20,
};

export function calculateDemoQuote(input: QuoteInput): Quote | null {
  if (!input.service || !(input.service in BASE_PRICES)) return null;
  if (input.units < 1) return null;

  const base   = BASE_PRICES[input.service];
  const amount = Math.round(
    base * input.units * FREQUENCY_MULTIPLIER[input.frequency] * REGION_FACTOR[input.region],
  );

  return { amount, currency: 'TZS' };
}

export function formatTZS(amount: number): string {
  return new Intl.NumberFormat('en-TZ', { maximumFractionDigits: 0 }).format(amount);
}
