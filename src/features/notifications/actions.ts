'use server';

import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';
import {
  CreateNotificationSchema,
  MarkReadSchema,
  MarkAllReadSchema,
  type NotificationWithUser,
} from './types';

// ─── Create Notification ───────────────────────────────

export async function createNotification(data: {
  userId: string;
  type: 'EMAIL' | 'SMS' | 'IN_APP';
  event: string;
  payload?: any;
}) {
  const validated = CreateNotificationSchema.parse(data);

  const notification = await prisma.notification.create({
    data: {
      userId: validated.userId,
      type: validated.type,
      event: validated.event,
      payload: validated.payload ?? null,
    },
  });

  return notification;
}

// ─── Get User Notifications ────────────────────────────

export async function getUserNotifications(userId?: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // If userId is provided, verify it matches the session user (or user is admin)
  const targetUserId = userId || session.user.id;
  
  if (targetUserId !== session.user.id && session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Cannot access other user notifications');
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: targetUserId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return notifications;
}

// ─── Get Unread Notification Count ────────────────────

export async function getUnreadNotificationCount(userId?: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const targetUserId = userId || session.user.id;

  if (targetUserId !== session.user.id && session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const count = await prisma.notification.count({
    where: {
      userId: targetUserId,
      isRead: false,
    },
  });

  return count;
}

// ─── Mark Notification as Read ────────────────────────

export async function markNotificationAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Verify the notification belongs to the user
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId: session.user.id,
    },
  });

  if (!notification) {
    throw new Error('Notification not found or access denied');
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return { success: true };
}

// ─── Mark All Notifications as Read ────────────────────

export async function markAllNotificationsAsRead(userId?: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const targetUserId = userId || session.user.id;

  if (targetUserId !== session.user.id && session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  await prisma.notification.updateMany({
    where: {
      userId: targetUserId,
      isRead: false,
    },
    data: { isRead: true },
  });

  return { success: true };
}

// ─── Fire Event (Create Notification from Event) ───────

export async function fireEvent(
  event: string,
  data: {
    userId: string;
    payload?: any;
    type?: 'EMAIL' | 'SMS' | 'IN_APP';
  }
) {
  const { EVENT_TEMPLATES } = await import('./types');
  
  const template = EVENT_TEMPLATES[event];
  
  if (!template) {
    // If no template, create a basic notification
    return createNotification({
      userId: data.userId,
      type: data.type || 'IN_APP',
      event,
      payload: data.payload,
    });
  }

  return createNotification({
    userId: data.userId,
    type: template.type,
    event,
    payload: template.getPayload(data),
  });
}

// ─── Delete Old Notifications (Maintenance) ───────────

export async function deleteOldNotifications(olderThanDays: number = 30) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await prisma.notification.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
      isRead: true,
    },
  });

  return { deleted: result.count };
}
