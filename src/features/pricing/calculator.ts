/**
 * Pricing calculator for service quotations.
 *
 * Final Price = (Base Rate × Rooms) × Frequency Multiplier × Tier Multiplier × Zone Multiplier
 *
 * All multipliers are expected to be expressed as a decimal factor (e.g., 1.2 for a 20% increase).
 */
export function calculatePrice(params: {
  baseRate: number; // monetary unit per room
  rooms: number; // number of rooms to service
  frequencyMultiplier: number; // e.g., 1 for one‑off, 0.9 for weekly discount
  tierMultiplier: number; // premium tier factor
  zoneMultiplier: number; // geographic zone factor
}): number {
  const {
    baseRate,
    rooms,
    frequencyMultiplier,
    tierMultiplier,
    zoneMultiplier,
  } = params;

  // Guard against invalid inputs – return 0 if any factor is non‑positive.
  if (baseRate <= 0 || rooms <= 0) return 0;

  const price =
    baseRate *
    rooms *
    frequencyMultiplier *
    tierMultiplier *
    zoneMultiplier;

  // Round to two decimal places (currency).
  return Math.round(price * 100) / 100;
}
