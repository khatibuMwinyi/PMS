import { prisma } from '@/core/database/client';

/**
 * Create a price lock for a given property, service type, and unit.
 * Returns the created lock or null if a lock already exists (unique constraint).
 */
export async function createPriceLock(
  propertyId: string,
  serviceTypeId: string,
  unitId: string,
  ttlHours = 24
) {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + ttlHours)
  try {
    const lock = await prisma.priceLock.create({
      data: {
        propertyId,
        serviceTypeId,
        unitId,
        expiresAt,
      },
    })
    return lock
  } catch (e: any) {
    // Unique constraint violation – lock already exists
    if (e.code === 'P2002') {
      return null
    }
    throw e
  }
}

/** Verify that a lock exists and has not expired. */
export async function verifyPriceLock(
  propertyId: string,
  serviceTypeId: string,
  unitId: string
) {
  const lock = await prisma.priceLock.findUnique({
    where: {
      propertyId_serviceTypeId_unitId: {
        propertyId,
        serviceTypeId,
        unitId,
      },
    },
  })
  if (!lock) return false
  if (lock.expiresAt < new Date()) return false
  return true
}

/** Release (delete) a lock, typically after a booking is confirmed or lock expires. */
export async function releasePriceLock(
  propertyId: string,
  serviceTypeId: string,
  unitId: string
) {
  await prisma.priceLock.delete({
    where: {
      propertyId_serviceTypeId_unitId: {
        propertyId,
        serviceTypeId,
        unitId,
      },
    },
  })
}

/** Cleanup job – delete all expired locks. */
export async function cleanupExpiredLocks() {
  await prisma.priceLock.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  })
}

export default {
  createPriceLock,
  verifyPriceLock,
  releasePriceLock,
  cleanupExpiredLocks,
}
