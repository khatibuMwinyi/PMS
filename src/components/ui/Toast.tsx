'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/core/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  /** Type of toast */
  type: ToastType;
  /** Main title of the toast */
  title: string;
  /** Optional detailed message */
  message?: string;
  /** Duration in milliseconds before auto-dismiss (default: 5000) */
  duration?: number;
  /** Function to call when toast is closed */
  onClose?: () => void;
  /** Custom CSS classes */
  className?: string;
  /** Whether toast is currently visible */
  isVisible?: boolean;
  /** Position of the toast */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface ToastContainerProps {
  /** Array of toasts to display */
  toasts: ToastProps[];
  /** Function to remove a toast */
  removeToast: (id: string) => void;
  /** Container position */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Toast notification component with accessibility support
 */
export function Toast({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  className,
  isVisible = true,
  position = 'top-right',
}: ToastProps) {
  const [isExiting, setIsExiting] = React.useState(false);

  // Auto-dismiss functionality
  React.useEffect(() => {
    if (duration === 0) return;

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  // Keyboard accessibility
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.();
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-error';
      case 'warning':
        return 'text-warning';
      case 'info':
        return 'text-info';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-success';
      case 'error':
        return 'border-error';
      case 'warning':
        return 'border-warning';
      case 'info':
        return 'border-info';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && !isExiting && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'pointer-events-auto max-w-sm w-full shadow-lg rounded-lg border',
            getBorderColor(),
            'bg-white dark:bg-gray-800',
            className
          )}
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className={cn('flex-shrink-0', getIconColor())}>
                {getIcon()}
              </div>
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {title}
                </h4>
                {message && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {message}
                  </p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={handleClose}
                  className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--border-focus)] rounded-md p-1.5"
                  aria-label="Close toast"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Container for managing multiple toasts
 */
export function ToastContainer({
  toasts,
  removeToast,
  position = 'top-right',
}: ToastContainerProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'fixed top-4 right-4 z-50 space-y-4';
      case 'top-left':
        return 'fixed top-4 left-4 z-50 space-y-4';
      case 'bottom-right':
        return 'fixed bottom-4 right-4 z-50 space-y-4';
      case 'bottom-left':
        return 'fixed bottom-4 left-4 z-50 space-y-4';
    }
  };

  return (
    <div className={getPositionClasses()}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.title}
            {...toast}
            onClose={() => removeToast(toast.title)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Hook for managing toast notifications
 */
export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'isVisible'>) => {
    setToasts((prev) => [
      ...prev,
      { ...toast, isVisible: true, id: Date.now().toString() },
    ]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showSuccess = (title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  };

  const showWarning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  };

  const showInfo = (title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  };

  const clearAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll,
  };
};