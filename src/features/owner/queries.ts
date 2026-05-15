import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';

/**
 * Recent owner invoices — derived from owner's Invoice rows
 * (or assignments where invoices not yet generated).
 */
export async function getOwnerInvoices() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const owner = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!owner) return [];

  const invoices = await prisma.invoice.findMany({
    where: {
      agreement: { property: { ownerId: owner.id } },
    },
    select: {
      id: true,
      createdAt: true,
      amount: true,
      status: true,
      agreement: {
        select: {
          serviceType: { select: { name: true } },
          property: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return invoices.map((i) => ({
    id: i.id,
    date: i.createdAt.toISOString(),
    service: i.agreement.serviceType.name,
    amount: Number(i.amount),
    property: i.agreement.property.name,
    status: i.status,
  }));
}

export default { getOwnerInvoices };
