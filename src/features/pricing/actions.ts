/**
 * Pricing actions – create a price lock and return a quote.
 *
 * The quote is calculated using the formula:
 *   Final Price = (Base Rate × Rooms) × Frequency × Tier × Zone
 *
 * After calculating, a lock is stored for 24 hours (default TTL) so the
 * price can be safely used for a booking.
 */
import { createPriceLock } from './lock'
import { calculatePrice } from './calculator'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createQuoteAndLock(params: {
  propertyId: string
  serviceTypeId: string
  unitId: string
  rooms: number
  frequencyMultiplier: number
  tierMultiplier: number
  zoneMultiplier: number
}) {
  // Get base rate from the service type
  const service = await prisma.serviceType.findUnique({
    where: { id: params.serviceTypeId },
    select: { basePrice: true },
  })
  if (!service) throw new Error('Service type not found')

  const baseRate = Number(service.basePrice)
  const price = calculatePrice({
    baseRate,
    rooms: params.rooms,
    frequencyMultiplier: params.frequencyMultiplier,
    tierMultiplier: params.tierMultiplier,
    zoneMultiplier: params.zoneMultiplier,
  })

  // Create a lock – returns null if a lock already exists
  const lock = await createPriceLock(
    params.propertyId,
    params.serviceTypeId,
    params.unitId,
  )

  return {
    quote: {
      amount: price,
      currency: 'TZS', // Assuming Tanzanian Shilling as per existing codebase
      expiresAt: lock?.expiresAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    lock,
  }
}

export default { createQuoteAndLock }
