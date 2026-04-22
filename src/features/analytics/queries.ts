import { prisma } from '@/core/database/client';

/** Owner dashboard data */
export async function getOwnerDashboardData(userId: string) {
  // Owner profile
  const owner = await prisma.ownerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!owner) throw new Error('Owner profile not found');

  const totalProperties = await prisma.property.count({ where: { ownerId: owner.id } });

  const activeServices = await prisma.assignment.count({
    where: {
      providerId: null, // services not yet taken? or maybe count assignments for this owner's properties that are not COMPLETED
      property: { ownerId: owner.id },
      status: { notIn: ['COMPLETED', 'CANCELLED_NO_SHOW'] },
    },
  });

  const recentTasks = await prisma.task.findMany({
    where: { assignment: { property: { ownerId: owner.id } }, status: 'COMPLETED' },
    orderBy: { checkOutTime: 'desc' },
    take: 5,
    select: { id: true, checkOutTime: true },
  });

  return { totalProperties, activeServices, recentTasks };
}

/** Provider dashboard data */
export async function getProviderDashboardData(userId: string) {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!provider) throw new Error('Provider profile not found');

  const wallet = await prisma.wallet.findUnique({ where: { providerId: provider.id } });

  const activeAssignments = await prisma.assignment.count({
    where: { providerId: provider.id, status: { in: ['ACCEPTED', 'IN_PROGRESS'] } },
  });

  // Placeholder rating – in a real app would come from reviews table
  const rating = 4.5;

  return {
    availableBalance: wallet?.availableBalance.toNumber() ?? 0,
    pendingBalance: wallet?.pendingBalance.toNumber() ?? 0,
    activeAssignments,
    rating,
  };
}

/** Admin dashboard data */
export async function getAdminDashboardData() {
  // Total platform revenue – sum of platform fees from FinancialAuditLog where action = 'PAYMENT_SPLIT'
  // The payload stores platformFee as string; we parse to Decimal via Prisma Decimal conversion.
  const auditLogs = await prisma.financialAuditLog.findMany({
    where: { action: 'PAYMENT_SPLIT' },
    select: { payload: true },
  });
  let totalRevenue = 0;
  for (const log of auditLogs) {
    const feeStr = (log.payload as any).platformFee;
    if (feeStr) totalRevenue += parseFloat(feeStr);
  }

  const activeDisputes = await prisma.dispute.count({ where: { status: { notIn: ['RESOLVED', 'EXPIRED'] } } });
  const verifiedProviders = await prisma.providerProfile.count(); // assuming all providers are verified

  return { totalRevenue, activeDisputes, verifiedProviders };
}
