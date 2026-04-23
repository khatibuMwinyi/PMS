'use client';

import * as React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from './button';

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRetry?: () => void;
}

interface ErrorStateProps {
  onRetry: () => void;
}

/**
 * Error state component to display when an error occurs
 */
function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        <svg
          className="w-16 h-16 text-[var(--state-error)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
        Something went wrong
      </h2>
      <p className="text-[var(--text-muted)] mb-6 max-w-md">
        We encountered an unexpected error. Please try again or contact support if the problem persists.
      </p>
      <Button onClick={onRetry} variant="primary">
        Try Again
      </Button>
    </div>
  );
}

/**
 * Wrapper component that provides error boundary functionality
 */
export function ErrorBoundaryWrapper({
  children,
  fallback,
  onRetry,
}: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary
      fallback={
        fallback || <ErrorState onRetry={onRetry || (() => window.location.reload())} />
      }
    >
      {children}
    </ErrorBoundary>
  );
}