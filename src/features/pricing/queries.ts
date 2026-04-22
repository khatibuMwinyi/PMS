import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/** Retrieve a specific price lock if it exists and is still valid */
export async function getPriceLock(
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
  if (!lock) return null
  if (lock.expiresAt < new Date()) return null // expired
  return lock
}

/** Return all active (non‑expired) price locks – useful for admin monitoring */
export async function listActivePriceLocks() {
  return prisma.priceLock.findMany({
    where: {
      expiresAt: { gt: new Date() },
    },
    orderBy: { expiresAt: 'asc' },
  })
}

export default { getPriceLock, listActivePriceLocks }
