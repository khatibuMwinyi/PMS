import Decimal from 'decimal.js';

type Amount = number | Decimal | string;

function toNumber(amount: Amount): number {
  if (typeof amount === 'number') return amount;
  if (typeof amount === 'string') return Number(amount);
  return amount.toNumber();
}

/**
 * Format a TZS amount with thousand separators.
 *
 * - Accepts `number`, `Decimal`, or numeric string.
 * - Omits decimals when value is integer; otherwise shows two.
 * - Negatives render as `-TZS 50` (sign before the prefix).
 */
export function formatTZS(amount: Amount): string {
  const n = toNumber(amount);
  const abs = Math.abs(n);
  const hasFraction = abs % 1 !== 0;
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return n < 0 ? `-TZS ${formatted}` : `TZS ${formatted}`;
}

/**
 * Compact TZS format for KPIs and sparklines.
 *
 * - `1_500` -> `TZS 1.5k`, `50_000` -> `TZS 50k`, `2_450_000` -> `TZS 2.45M`.
 * - Below 1k uses the long format (no suffix).
 * - Negatives render as `-TZS 1.5M` (sign before the prefix), matching {@link formatTZS}.
 */
export function formatTZSShort(amount: Amount): string {
  const n = toNumber(amount);
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    return `${sign}TZS ${(abs / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  }
  if (abs >= 1_000) {
    return `${sign}TZS ${(abs / 1_000).toFixed(2).replace(/\.?0+$/, '')}k`;
  }
  return `${sign}TZS ${abs.toLocaleString('en-US')}`;
}
