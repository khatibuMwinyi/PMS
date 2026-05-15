import 'server-only';
import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';
import type { NotificationWithUser } from './types';

export async function getMyNotifications(limit: number = 20, offset: number = 0) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  return prisma.notification.findMany({
    where: { recipientId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    select: {
      id: true,
      channel: true,
      event: true,
      payload: true,
      isRead: true,
      createdAt: true,
    },
  });
}

export async function getMyUnreadCount() {
  const session = await auth();
  if (!session?.user) return 0;

  return prisma.notification.count({
    where: { recipientId: session.user.id, isRead: false },
  });
}

export async function getAllNotifications(
  filters?: {
    recipientId?: string;
    event?: string;
    isRead?: boolean;
    startDate?: Date;
    endDate?: Date;
  },
  limit: number = 50,
  offset: number = 0,
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  const where: any = {};
  if (filters?.recipientId) where.recipientId = filters.recipientId;
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
      recipient: { select: { id: true, email: true, role: true } },
    },
  });

  return notifications as unknown as NotificationWithUser[];
}

export async function getNotificationStats() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  const [totalCount, unreadCount, eventCounts, channelCounts] = await Promise.all([
    prisma.notification.count(),
    prisma.notification.count({ where: { isRead: false } }),
    prisma.notification.groupBy({
      by: ['event'],
      _count: { event: true },
    }),
    prisma.notification.groupBy({
      by: ['channel'],
      _count: { channel: true },
    }),
  ]);

  return {
    total: totalCount,
    unread: unreadCount,
    byEvent: eventCounts.map((ec) => ({ event: ec.event, count: ec._count.event })),
    byChannel: channelCounts.map((cc) => ({ channel: cc.channel, count: cc._count.channel })),
  };
}
