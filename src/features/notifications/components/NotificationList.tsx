'use client';

import { useEffect, useState } from 'react';
import { CheckCheck, Loader2, Bell, Filter } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { getMyNotifications, getMyUnreadCount, markNotificationAsRead, markAllNotificationsAsRead } from '@/features/notifications/queries';
import type { NotificationWithUser } from '@/features/notifications/types';

export function NotificationList() {
  const [notifications, setNotifications] = useState<NotificationWithUser[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const [notes, count] = await Promise.all([
        getMyNotifications(50, 0),
        getMyUnreadCount(),
      ]);
      setNotifications(notes as NotificationWithUser[]);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'AUTH_REGISTER':
        return '🎉';
      case 'QUOTE_REQUESTED':
        return '📋';
      case 'QUOTE_ACCEPTED':
        return '✅';
      case 'AGREEMENT_SUBMITTED':
        return '📄';
      default:
        return '🔔';
    }
  };

  const getEventMessage = (notification: NotificationWithUser) => {
    if (notification.payload && typeof notification.payload === 'object') {
      const payload = notification.payload as any;
      if (payload.message) return payload.message;
    }
    
    switch (notification.event) {
      case 'AUTH_REGISTER':
        return 'Welcome! Your account has been created.';
      case 'QUOTE_REQUESTED':
        return 'New quote requested for your property.';
      case 'QUOTE_ACCEPTED':
        return 'Quote accepted! Agreement created.';
      case 'AGREEMENT_SUBMITTED':
        return 'Agreement submitted and pending assignment.';
      default:
        return `Event: ${notification.event}`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell size={24} className="text-[var(--brand-primary)]" />
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">
              Notifications
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 rounded-lg transition-colors"
          >
            <CheckCheck size={16} />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-subtle)]">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            filter === 'all'
              ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          )}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            filter === 'unread'
              ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          )}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-[var(--text-muted)]" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-secondary)]">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg border transition-colors',
                notification.isRead
                  ? 'border-[var(--border-subtle)] bg-[var(--surface-card)]'
                  : 'border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5'
              )}
              onClick={() => {
                if (!notification.isRead) {
                  handleMarkRead(notification.id);
                }
              }}
            >
              <span className="text-2xl">{getEventIcon(notification.event)}</span>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm',
                  notification.isRead ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)] font-medium'
                )}>
                  {getEventMessage(notification)}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {formatDateTime(notification.createdAt)}
                </p>
              </div>

              {!notification.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkRead(notification.id);
                  }}
                  className="text-xs text-[var(--brand-primary)] hover:text-[var(--brand-primary-dark)] transition-colors"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
