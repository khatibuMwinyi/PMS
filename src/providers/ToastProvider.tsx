'use client';

import { ReactNode, useCallback } from 'react';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/components/ui/Toast';

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Toast provider for global toast notifications
 * Wraps the application and provides toast functionality
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <ToastContainer
        toasts={toasts}
        removeToast={removeToast}
        position="top-right"
      />
    </>
  );
}

/**
 * Hook for using toast notifications anywhere in the app
 * Simplifies the use of toast functionality
 */
export const useAppToast = () => {
  const { showSuccess, showError, showWarning, showInfo, clearAll } = useToast();

  const toast = useCallback(
    (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
      switch (type) {
        case 'success':
          showSuccess(title, message);
          break;
        case 'error':
          showError(title, message);
          break;
        case 'warning':
          showWarning(title, message);
          break;
        case 'info':
          showInfo(title, message);
          break;
      }
    },
    [showSuccess, showError, showWarning, showInfo]
  );

  return {
    toast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll,
  };
};