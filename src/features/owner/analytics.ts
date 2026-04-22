import { prisma } from '@/core/database/client'
import { auth } from '@/core/auth'

/**
 * Simple analytics for an owner: number of properties, total completed services,
 * and total revenue earned from those services.
 */
export async function getOwnerAnalytics() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized')
  }

  const owner = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!owner) return { totalProperties: 0, completedServices: 0, totalRevenue: 0 }

  const [totalProperties, completedAssignments] = await Promise.all([
    prisma.property.count({ where: { ownerId: owner.id } }),
    prisma.assignment.findMany({
      where: { property: { ownerId: owner.id }, status: 'COMPLETED' },
      select: { serviceType: { select: { basePrice: true } } },
    }),
  ])

  const totalRevenue = completedAssignments.reduce((sum, a) => {
    const price = a.serviceType.basePrice?.toNumber?.() ?? Number(a.serviceType.basePrice)
    return sum + price
  }, 0)

  return {
    totalProperties,
    completedServices: completedAssignments.length,
    totalRevenue,
  }
}

export default { getOwnerAnalytics }
