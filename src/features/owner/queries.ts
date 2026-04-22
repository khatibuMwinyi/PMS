import { prisma } from '@/core/database/client'
import { auth } from '@/core/auth'

/**
 * Fetch recent completed assignments (treated as invoices) for the logged‑in owner.
 * Returns basic info needed for an invoice list.
 */
export async function getOwnerInvoices() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized')
  }

  const owner = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!owner) return []

  const invoices = await prisma.assignment.findMany({
    where: {
      property: { ownerId: owner.id },
      status: 'COMPLETED',
    },
    select: {
      id: true,
      createdAt: true,
      serviceType: { select: { name: true, basePrice: true } },
      property: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return invoices.map((i) => ({
    id: i.id,
    date: i.createdAt.toISOString(),
    service: i.serviceType.name,
    amount: i.serviceType.basePrice.toNumber(),
    property: i.property.name,
  }))
}

export default { getOwnerInvoices }
