import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';
import type { NotificationWithUser } from './types';

// ─── Query Notifications for Current User ───────────

export async function getMyNotifications(limit: number = 20, offset: number = 0) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    select: {
      id: true,
      type: true,
      event: true,
      payload: true,
      isRead: true,
      createdAt: true,
    },
  });

  return notifications;
}

// ─── Get Unread Count for Current User ───────────────

export async function getMyUnreadCount() {
  const session = await auth();
  if (!session?.user) {
    return 0;
  }

  const count = await prisma.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
    },
  });

  return count;
}

// ─── Get All Notifications (Admin) ───────────────────

export async function getAllNotifications(
  filters?: {
    userId?: string;
    event?: string;
    isRead?: boolean;
    startDate?: Date;
    endDate?: Date;
  },
  limit: number = 50,
  offset: number = 0
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  const where: any = {};

  if (filters?.userId) where.userId = filters.userId;
  if (filters?.event) where.event = filters.event;
  if (filters?.isRead !== undefined) where.isRead = filters.isRead;
  
  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = filters.startDate;
    if (filters.endDate) where.createdAt.lte = filters.endDate;
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return notifications as NotificationWithUser[];
}

// ─── Get Notification Stats (Admin) ─────────────────

export async function getNotificationStats() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  const [
    totalCount,
    unreadCount,
    eventCounts,
    typeCounts,
  ] = await Promise.all([
    prisma.notification.count(),
    prisma.notification.count({ where: { isRead: false } }),
    prisma.notification.groupBy({
      by: ['event'],
      _count: { event: true },
    }),
    prisma.notification.groupBy({
      by: ['type'],
      _count: { type: true },
    }),
  ]);

  return {
    total: totalCount,
    unread: unreadCount,
    byEvent: eventCounts.map((ec) => ({ event: ec.event, count: ec._count.event })),
    byType: typeCounts.map((tc) => ({ type: tc.type, count: tc._count.type })),
  };
}
