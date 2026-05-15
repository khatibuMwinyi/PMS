import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/auth';
import { prisma } from '@/core/database/client';
import { getSMSProvider } from '@/integrations/sms';
import type { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  const unreadOnly = searchParams.get('unreadOnly') === 'true';

  const where: Prisma.NotificationWhereInput = { recipientId: session.user.id };
  if (unreadOnly) where.isRead = false;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
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
    }),
    prisma.notification.count({
      where: { recipientId: session.user.id, isRead: false },
    }),
  ]);

  return NextResponse.json({
    notifications,
    unreadCount,
    pagination: {
      limit,
      offset,
      hasMore: notifications.length === limit,
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { recipientId, channel, event, payload, sendSMS: shouldSendSMS } = body;

    if (!recipientId || !event) {
      return NextResponse.json(
        { error: 'Missing required fields: recipientId, event' },
        { status: 400 },
      );
    }

    const notification = await prisma.notification.create({
      data: {
        recipientId,
        channel: channel || 'IN_APP',
        event,
        payload: (payload ?? {}) as Prisma.InputJsonValue,
      },
    });

    if (shouldSendSMS && (channel === 'SMS' || event.includes('SMS'))) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: recipientId },
          select: { phone: true },
        });
        if (user?.phone) {
          const provider = getSMSProvider();
          const message = payload?.message || `Notification: ${event}`;
          await provider.sendSMS(user.phone, message);
        }
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
      }
    }

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      const result = await prisma.notification.updateMany({
        where: { recipientId: session.user.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ updated: result.count });
    }

    if (notificationId) {
      const notification = await prisma.notification.findFirst({
        where: { id: notificationId, recipientId: session.user.id },
      });
      if (!notification) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Missing notificationId or markAll flag' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Failed to update notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  try {
    const { olderThanDays = 30 } = await request.json();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.notification.deleteMany({
      where: { createdAt: { lt: cutoffDate }, isRead: true },
    });
    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error('Failed to delete notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
