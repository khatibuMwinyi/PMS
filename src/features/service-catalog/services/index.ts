import 'server-only';
import Decimal from 'decimal.js';
import { prisma } from '@/core/database/client';
import { PriceUnit } from '@prisma/client';

export interface CatalogEntry {
  id: string;
  name: string;
  description: string;
  basePriceFormatted: string;
  priceUnitLabel: string;
}

const PRICE_UNIT_LABEL: Record<PriceUnit, string> = {
  FLAT:        'flat per service',
  PER_SQM:     'per m²',
  PER_UNIT:    'per unit',
  PER_BEDROOM: 'per bedroom',
};

export async function getActiveCatalog(): Promise<CatalogEntry[]> {
  const rows = await prisma.serviceType.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, description: true, basePrice: true, priceUnit: true },
  });

  return rows.map((r) => {
    const price = new Decimal(r.basePrice.toString());
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      basePriceFormatted: `TZS ${price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      priceUnitLabel: PRICE_UNIT_LABEL[r.priceUnit],
    };
  });
}
