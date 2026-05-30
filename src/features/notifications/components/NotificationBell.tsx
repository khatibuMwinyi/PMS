'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, X, CheckCheck, Loader2 } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { getUserNotifications, getUnreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead } from '@/features/notifications/actions';
import type { NotificationWithUser } from '@/features/notifications/types';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationWithUser[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const [notes, count] = await Promise.all([
        getUserNotifications(),
        getUnreadNotificationCount(),
      ]);
      setNotifications(notes as NotificationWithUser[]);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleMarkRead = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
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

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getEventMessage = (notification: NotificationWithUser) => {
    if (notification.payload && typeof notification.payload === 'object') {
      const payload = notification.payload as any;
      if (payload.message) return payload.message;
    }
    
    // Fallback to event-based messages
    switch (notification.event) {
      case 'AUTH_REGISTER':
        return 'Welcome! Your account has been created.';
      case 'QUOTE_REQUESTED':
        return 'New quote requested.';
      case 'QUOTE_ACCEPTED':
        return 'Quote accepted!';
      case 'AGREEMENT_SUBMITTED':
        return 'Agreement submitted.';
      default:
        return notification.event;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        className="relative rounded-full p-2 hover:bg-[var(--surface-overlay)] transition-colors duration-120"
      >
        <Bell size={18} className="text-[var(--text-muted)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-caption font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[var(--surface-card)] rounded-lg border border-[var(--border-subtle)] shadow-lg z-[9999] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-[var(--brand-primary)] hover:text-[var(--brand-primary-dark)] transition-colors"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-[var(--text-muted)]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 hover:bg-[var(--surface-overlay)] transition-colors cursor-pointer border-b border-[var(--border-subtle)] last:border-0',
                    !notification.isRead && 'bg-blue-50/50 dark:bg-blue-900/10'
                  )}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkRead(notification.id, {} as React.MouseEvent);
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm',
                      notification.isRead ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)] font-medium'
                    )}>
                      {getEventMessage(notification)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkRead(notification.id, e)}
                      className="mt-0.5 text-xs text-[var(--brand-primary)] hover:text-[var(--brand-primary-dark)] transition-colors"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
