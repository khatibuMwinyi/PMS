'use server';

import { prisma } from '@/core/database/client';
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } from 'date-fns';

/**
 * Provider analytics data structure
 */
export interface ProviderAnalytics {
  earnings: {
    total: number;
    pending: number;
    available: number;
    weekly: number;
    byService: Array<{
      serviceType: string;
      amount: number;
      count: number;
    }>;
  };
  performance: {
    rating: number;
    totalRating: number;
    ratingCount: number;
    completionRate: number;
    acceptanceRate: number;
    responsiveness: number;
    strikeCount: number;
  };
  tasks: {
    completed: number;
    pending: number;
    accepted: number;
    disputed: number;
    upcoming: Array<{
      id: string;
      serviceType: string;
      property: string;
      scheduledAt: string;
    }>;
  };
  trends: {
    earnings7d: number[];
    earnings30d: number[];
    ratingTrend: number[];
  };
}

/**
 * Get comprehensive provider analytics
 */
export async function getProviderAnalytics(providerId: string): Promise<ProviderAnalytics> {
  // Get provider profile first
  const provider = await prisma.providerProfile.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    throw new Error('Provider not found');
  }

  // Calculate earnings
  const earnings = await calculateEarnings(providerId);

  // Calculate performance metrics
  const performance = await calculatePerformance(providerId);

  // Get task statistics
  const tasks = await getTaskStats(providerId);

  // Get trends
  const trends = await getTrends(providerId);

  return {
    earnings,
    performance,
    tasks,
    trends,
  };
}

/**
 * Calculate earnings breakdown
 */
async function calculateEarnings(providerId: string) {
  // Get all wallet transactions for SETTLED status
  const transactions = await prisma.walletTransaction.findMany({
    where: {
      wallet: {
        providerId: providerId,
      },
      status: 'SETTLED',
      type: 'CREDIT',
    },
  });

  // Get pending transactions
  const pendingTransactions = await prisma.walletTransaction.findMany({
    where: {
      wallet: {
        providerId: providerId,
      },
      status: 'PENDING',
      type: 'CREDIT',
    },
  });

  const totalEarnings = transactions.reduce((sum, t) => sum + t.amount.toNumber(), 0);
  const pendingEarnings = pendingTransactions.reduce((sum, t) => sum + t.amount.toNumber(), 0);

  // Get wallet balance
  const wallet = await prisma.wallet.findUnique({
    where: { providerId: providerId },
  });

  const availableBalance = wallet?.availableBalance.toNumber() || 0;

  // Earnings by service type
  const earningsByService = await prisma.$queryRaw`
    SELECT
      st.name as service_type,
      SUM(COALESCE(wt.amount, 0)) as amount,
      COUNT(*) as count
    FROM wallet wt
    JOIN assignments a ON wt.reference = a.id
    JOIN service_types st ON a.service_type_id = st.id
    WHERE wt.provider_id = ${providerId}
    AND wt.status = 'SETTLED'
    AND wt.type = 'CREDIT'
    GROUP BY st.name
    ORDER BY amount DESC
  ` as Array<{
    service_type: string;
    amount: number;
    count: number;
  }>;

  // Weekly earnings (last 7 days)
  const weekStart = startOfDay(subDays(new Date(), 7));
  const weekEnd = endOfDay(new Date());

  const weeklyEarnings = await prisma.walletTransaction.aggregate({
    where: {
      wallet: {
        providerId: providerId,
      },
      status: 'SETTLED',
      type: 'CREDIT',
      createdAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    _sum: { amount: true },
  });

  return {
    total: totalEarnings,
    pending: pendingEarnings,
    available: availableBalance,
    weekly: weeklyEarnings._sum.amount?.toNumber() || 0,
    byService: earningsByService.map(item => ({
      serviceType: item.service_type,
      amount: item.amount,
      count: item.count,
    })),
  };
}

/**
 * Calculate performance metrics
 */
async function calculatePerformance(providerId: string) {
  // Get assignments for rating calculation
  const ratedAssignments = await prisma.assignment.findMany({
    where: {
      providerId: providerId,
      status: 'COMPLETED',
    },
    select: {
      rating: true,
    },
  });

  // Calculate average rating
  const ratings = ratedAssignments.map(a => a.rating).filter(r => r !== null);
  const rating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + (r || 0), 0) / ratings.length
    : 0;

  // Get total assignments
  const totalAssignments = await prisma.assignment.count({
    where: { providerId: providerId },
  });

  // Get completed assignments
  const completedAssignments = await prisma.assignment.count({
    where: {
      providerId: providerId,
      status: 'COMPLETED',
    },
  });

  // Get accepted assignments
  const acceptedAssignments = await prisma.assignment.count({
    where: {
      providerId: providerId,
      status: 'ACCEPTED',
    },
  });

  const completionRate = totalAssignments > 0
    ? (completedAssignments / totalAssignments) * 100
    : 0;

  const acceptanceRate = totalAssignments > 0
    ? (acceptedAssignments / totalAssignments) * 100
    : 0;

  // Get provider profile for responsiveness
  const providerProfile = await prisma.providerProfile.findUnique({
    where: { id: providerId },
  });

  return {
    rating: parseFloat(rating.toFixed(2)),
    totalRating: ratings.length,
    ratingCount: ratings.length,
    completionRate: parseFloat(completionRate.toFixed(2)),
    acceptanceRate: parseFloat(acceptanceRate.toFixed(2)),
    responsiveness: providerProfile?.responsiveness || 0,
    strikeCount: providerProfile?.strikeCount || 0,
  };
}

/**
 * Get task statistics
 */
async function getTaskStats(providerId: string) {
  // Get current tasks by status
  const [completed, pending, accepted, disputed] = await Promise.all([
    prisma.task.count({
      where: {
        assignment: { providerId: providerId },
        status: 'COMPLETED',
      },
    }),
    prisma.task.count({
      where: {
        assignment: { providerId: providerId },
        status: 'PENDING',
      },
    }),
    prisma.assignment.count({
      where: {
        providerId: providerId,
        status: 'ACCEPTED',
      },
    }),
    prisma.task.count({
      where: {
        assignment: { providerId: providerId },
        status: 'DISPUTED',
      },
    }),
  ]);

  // Get upcoming assignments (next 7 days)
  const weekFromNow = endOfDay(addDays(new Date(), 7));
  const upcoming = await prisma.assignment.findMany({
    where: {
      providerId: providerId,
      status: 'ACCEPTED',
      OR: [
        { task: { checkInTime: { lte: weekFromNow } } },
        { expiresAt: { lte: weekFromNow } },
      ],
    },
    include: {
      serviceType: { select: { name: true } },
      property: { select: { name: true } },
    },
    orderBy: { expiresAt: 'asc' },
    take: 10,
  });

  return {
    completed,
    pending,
    accepted,
    disputed,
    upcoming: upcoming.map(a => ({
      id: a.id,
      serviceType: a.serviceType.name,
      property: a.property.name,
      scheduledAt: a.expiresAt.toISOString(),
    })),
  };
}

/**
 * Get trend data for charts
 */
async function getTrends(providerId: string) {
  const now = new Date();

  // Last 7 days earnings by day
  const earnings7d = [];
  for (let i = 6; i >= 0; i--) {
    const day = subDays(now, i);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    const dayEarnings = await prisma.walletTransaction.aggregate({
      where: {
        wallet: {
          providerId: providerId,
        },
        status: 'SETTLED',
        type: 'CREDIT',
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      _sum: { amount: true },
    });

    earnings7d.push(dayEarnings._sum.amount?.toNumber() || 0);
  }

  // Last 30 days earnings by week
  const earnings30d = [];
  for (let i = 4; i >= 0; i--) {
    const weekStart = startOfWeek(subDays(now, i * 7));
    const weekEnd = endOfWeek(subDays(now, i * 7));

    const weekEarnings = await prisma.walletTransaction.aggregate({
      where: {
        wallet: {
          providerId: providerId,
        },
        status: 'SETTLED',
        type: 'CREDIT',
        createdAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      _sum: { amount: true },
    });

    earnings30d.push(weekEarnings._sum.amount?.toNumber() || 0);
  }

  // Rating trend (last 10 ratings)
  const ratings = await prisma.assignment.findMany({
    where: {
      providerId: providerId,
      status: 'COMPLETED',
      rating: { not: null },
    },
    orderBy: { completedAt: 'desc' },
    take: 10,
    select: { rating: true },
  });

  const ratingTrend = ratings.map(a => a.rating || 0);

  return {
    earnings7d,
    earnings30d,
    ratingTrend,
  };
}

// Helper function
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}