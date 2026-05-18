'use server';

import { prisma } from '@/core/database/client';
import { startOfDay, endOfDay, addDays, subDays } from 'date-fns';
import type { ProviderDashboardData } from '../schemas/provider-dashboard.schema';

export async function getProviderDashboard(providerUserId: string): Promise<ProviderDashboardData> {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId: providerUserId },
    include: { wallet: true },
  });
  if (!provider) return emptyDashboard();

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const sevenDaysAgo = subDays(now, 7);
  const fourteenDaysAgo = subDays(now, 14);

  const todayEarningsAgg = await prisma.walletTransaction.aggregate({
    where: {
      wallet: { providerId: provider.id },
      type: 'EARNING',
      createdAt: { gte: todayStart, lte: todayEnd },
    },
    _sum: { amount: true },
  });

  const activeAssignments = await prisma.assignment.findMany({
    where: {
      providerId: provider.id,
      status: { in: ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'] },
    },
    select: {
      id: true,
      status: true,
      scheduledDate: true,
      serviceType: { select: { name: true } },
      property: { select: { zone: true } },
      tasks: {
        where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
        orderBy: { scheduledFor: 'asc' },
        take: 1,
        select: { id: true, scheduledFor: true },
      },
    },
    orderBy: { scheduledDate: 'asc' },
    take: 10,
  });

  const [acceptedLast7, offeredLast7, acceptedPrev7, offeredPrev7] = await Promise.all([
    prisma.assignment.count({ where: { providerId: provider.id, acceptedAt: { gte: sevenDaysAgo } } }),
    prisma.assignment.count({ where: { providerId: provider.id, expiresAt: { gte: sevenDaysAgo } } }),
    prisma.assignment.count({ where: { providerId: provider.id, acceptedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
    prisma.assignment.count({ where: { providerId: provider.id, expiresAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
  ]);
  const rateNow = offeredLast7 > 0 ? (acceptedLast7 / offeredLast7) * 100 : 0;
  const ratePrev = offeredPrev7 > 0 ? (acceptedPrev7 / offeredPrev7) * 100 : 0;

  const upcoming = activeAssignments
    .map((a) => ({ a, t: a.tasks[0] }))
    .filter((x) => x.t && x.t.scheduledFor > now && x.t.scheduledFor <= addDays(now, 2))
    .sort((a, b) => a.t!.scheduledFor.getTime() - b.t!.scheduledFor.getTime())[0];

  const todayProgress = buildTodayProgress(activeAssignments);

  const amt = todayEarningsAgg._sum.amount as { toNumber: () => number } | number | null | undefined;
  const todayTZS = amt == null ? 0 : typeof amt === 'number' ? amt : amt.toNumber();

  return {
    earnings: {
      todayTZS,
      pendingTZS: provider.wallet?.pendingBalance.toNumber() ?? 0,
      availableTZS: provider.wallet?.availableBalance.toNumber() ?? 0,
    },
    metrics: {
      activeTaskCount: activeAssignments.length,
      acceptanceRate: parseFloat(rateNow.toFixed(1)),
      acceptanceRateDeltaPct: parseFloat((rateNow - ratePrev).toFixed(1)),
      rating: parseFloat(provider.rating.toFixed(2)),
      ratingCount: provider.completedJobs,
      strikeCount: provider.strikeCount,
    },
    nextUpcoming: upcoming
      ? {
          assignmentId: upcoming.a.id,
          taskId: upcoming.t!.id,
          serviceTypeName: upcoming.a.serviceType.name,
          zone: upcoming.a.property.zone,
          scheduledFor: upcoming.t!.scheduledFor.toISOString(),
          priority: 'ROUTINE',
          estDurationHours: 1.5,
        }
      : null,
    pipeline: activeAssignments.map((a) => ({
      assignmentId: a.id,
      serviceTypeName: a.serviceType.name,
      zone: a.property.zone,
      scheduledFor: a.scheduledDate?.toISOString() ?? null,
      status: a.status,
    })),
    todayProgress,
  };
}

function emptyDashboard(): ProviderDashboardData {
  return {
    earnings: { todayTZS: 0, pendingTZS: 0, availableTZS: 0 },
    metrics: { activeTaskCount: 0, acceptanceRate: 0, acceptanceRateDeltaPct: 0, rating: 0, ratingCount: 0, strikeCount: 0 },
    nextUpcoming: null,
    pipeline: [],
    todayProgress: [],
  };
}

function buildTodayProgress(
  assignments: Array<{ id: string; status: string; tasks: Array<{ id: string; scheduledFor: Date }> }>,
): ProviderDashboardData['todayProgress'] {
  const inProgress = assignments.find((a) => a.status === 'IN_PROGRESS');
  const upcomingToday = assignments.find((a) => a.tasks[0] && isToday(a.tasks[0].scheduledFor) && a.status === 'ACCEPTED');
  return [
    {
      key: 'briefing',
      label: 'Morning Briefing',
      state: 'completed',
      detail: 'Daily plan reviewed',
    },
    {
      key: 'in_transit',
      label: inProgress ? `Task ${inProgress.id.slice(0, 6).toUpperCase()} in progress` : 'No active task',
      state: inProgress ? 'active' : 'pending',
      detail: inProgress ? 'Provider checked in' : '—',
    },
    {
      key: 'next',
      label: upcomingToday ? `Next: ${upcomingToday.id.slice(0, 6).toUpperCase()}` : 'No remaining tasks today',
      state: 'pending',
      detail: upcomingToday?.tasks[0]?.scheduledFor.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) ?? '—',
    },
  ];
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}
