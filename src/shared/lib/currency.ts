import Decimal from 'decimal.js';

type Amount = number | Decimal | string;

function toNumber(amount: Amount): number {
  if (typeof amount === 'number') return amount;
  if (typeof amount === 'string') return Number(amount);
  return amount.toNumber();
}

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

export function formatTZSShort(amount: Amount): string {
  const n = toNumber(amount);
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `TZS ${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (abs >= 1_000) return `TZS ${(n / 1_000).toFixed(0)}k`;
  return `TZS ${n.toLocaleString('en-US')}`;
}
