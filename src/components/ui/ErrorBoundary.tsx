'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { cn } from '@/core/lib/utils';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  onReset?: () => void;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Error boundary component that catches JavaScript errors in child components
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to error tracking service
    console.error('Error caught by boundary:', error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Report error to monitoring service
    if (typeof window !== 'undefined' && window.errorTrackingService) {
      window.errorTrackingService.reportError(error, errorInfo);
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });

    // Call custom reset handler if provided
    this.props.onReset?.();

    // Reset keys if provided
    if (this.props.resetKeys) {
      this.props.resetKeys.forEach((key) => {
        const resetCallback = this.props.resetKeys?.find((k) => k === key);
        if (typeof resetCallback === 'function') {
          resetCallback();
        }
      });
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={cn('min-h-screen flex items-center justify-center p-6', this.props.className)}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full text-center"
          >
            {/* Error icon */}
            <div className="mx-auto mb-6">
              <div className="w-16 h-16 bg-[var(--state-error-bg)] rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-[var(--state-error)]" />
              </div>
            </div>

            {/* Error title */}
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
              Oops! Something went wrong
            </h1>

            {/* Error message */}
            <p className="text-[var(--text-secondary)] mb-6">
              We encountered an unexpected error while loading this page.
              Don't worry, your data is safe.
            </p>

            {/* Error details (in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6">
                <summary className="text-sm font-medium cursor-pointer text-[var(--text-primary)]">
                  Error details (Development)
                </summary>
                <div className="mt-2 p-4 bg-[var(--surface-overlay)] rounded-lg text-xs overflow-auto max-h-40">
                  <p className="font-mono text-[var(--state-error)] mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-[var(--text-muted)]">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action buttons */}
            <div className="space-y-3">
              <UnifiedButton
                variant="primary"
                onClick={this.resetErrorBoundary}
                leftIcon={<RefreshCw className="w-4 h-4" />}
                className="w-full"
              >
                Try again
              </UnifiedButton>

              <UnifiedButton
                variant="outline"
                onClick={() => window.location.reload()}
                leftIcon={<ExternalLink className="w-4 h-4" />}
                className="w-full"
              >
                Reload page
              </UnifiedButton>
            </div>

            {/* Support info */}
            <p className="text-xs text-[var(--text-muted)] mt-6">
              If the problem persists, please contact support.
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for error boundary with reset functionality
 */
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = React.useState<React.ErrorInfo | null>(null);

  const resetError = () => {
    setError(null);
    setErrorInfo(null);
  };

  const captureError = (err: Error, info: React.ErrorInfo) => {
    setError(err);
    setErrorInfo(info);
  };

  return { error, errorInfo, resetError, captureError };
};

/**
 * Wrapper component for individual error boundaries
 */
export const ErrorBoundaryWrapper = ({
  children,
  fallback,
  onError,
  onRetry,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
  onRetry?: () => void;
}) => {
  const { error, resetError } = useErrorBoundary();

  const handleRetry = () => {
    resetError();
    onRetry?.();
  };

  if (error) {
    return (
      <div className="p-6">
        {fallback || (
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Component Error</h2>
            <p className="text-sm text-muted mb-4">
              {error.message}
            </p>
            <UnifiedButton onClick={handleRetry} size="sm">
              Reset
            </UnifiedButton>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Hook for safe async operations
 */
export const useAsyncError = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const asyncWithError = async <T,>(asyncFunction: () => Promise<T>): Promise<T | null> => {
    try {
      return await asyncFunction();
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
        console.error('Async operation failed:', err);
      }
      return null;
    }
  };

  const clearError = () => setError(null);

  return { error, clearError, asyncWithError };
};

/**
 * Higher-order component for error boundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  return (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
};