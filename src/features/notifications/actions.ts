'use server';

import type { Prisma } from '@prisma/client';
import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';
import { CreateNotificationSchema } from './types';

export async function createNotification(data: {
  recipientId: string;
  channel: 'EMAIL' | 'SMS' | 'IN_APP' | 'PUSH';
  event: string;
  payload?: Record<string, unknown>;
}) {
  const validated = CreateNotificationSchema.parse(data);

  return prisma.notification.create({
    data: {
      recipientId: validated.recipientId,
      channel: validated.channel,
      event: validated.event,
      payload: (validated.payload ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function getUserNotifications(userId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const targetUserId = userId || session.user.id;
  if (targetUserId !== session.user.id && session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Cannot access other user notifications');
  }

  return prisma.notification.findMany({
    where: { recipientId: targetUserId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function getUnreadNotificationCount(userId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const targetUserId = userId || session.user.id;
  if (targetUserId !== session.user.id && session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  return prisma.notification.count({
    where: { recipientId: targetUserId, isRead: false },
  });
}

export async function markNotificationAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, recipientId: session.user.id },
  });
  if (!notification) throw new Error('Notification not found or access denied');

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
  return { success: true };
}

export async function markAllNotificationsAsRead(userId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const targetUserId = userId || session.user.id;
  if (targetUserId !== session.user.id && session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  await prisma.notification.updateMany({
    where: { recipientId: targetUserId, isRead: false },
    data: { isRead: true },
  });
  return { success: true };
}

export async function fireEvent(
  event: string,
  data: {
    recipientId: string;
    payload?: Record<string, unknown>;
    channel?: 'EMAIL' | 'SMS' | 'IN_APP' | 'PUSH';
  },
) {
  const { EVENT_TEMPLATES } = await import('./types');
  const template = EVENT_TEMPLATES[event];

  if (!template) {
    return createNotification({
      recipientId: data.recipientId,
      channel: data.channel || 'IN_APP',
      event,
      payload: data.payload,
    });
  }

  return createNotification({
    recipientId: data.recipientId,
    channel: template.channel,
    event,
    payload: template.getPayload(data),
  });
}

export async function deleteOldNotifications(olderThanDays: number = 30) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await prisma.notification.deleteMany({
    where: { createdAt: { lt: cutoffDate }, isRead: true },
  });
  return { deleted: result.count };
}
