'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';

export type SkeletonVariant = 'text' | 'avatar' | 'button' | 'card' | 'image';
export type SkeletonSize = 'sm' | 'md' | 'lg';

interface SkeletonProps {
  /** Visual style variant */
  variant?: SkeletonVariant;
  /** Size of the skeleton */
  size?: SkeletonSize;
  /** Number of lines for text variant */
  lines?: number;
  /** Width percentage for skeleton */
  width?: string | number;
  /** Height for skeleton */
  height?: string | number;
  /** Whether skeleton should animate */
  animated?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Describes the skeleton for screen readers */
  ariaDescribedBy?: string;
}

const sizeClasses = {
  sm: 'h-4 text-xs',
  md: 'h-6 text-sm',
  lg: 'h-8 text-base',
};

const widthClasses = {
  sm: 'w-20',
  md: 'w-full',
  lg: 'w-32',
};

/**
 * Skeleton loading component with multiple variants
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({
    variant = 'text',
    size = 'md',
    lines = 1,
    width,
    height,
    animated = true,
    className,
    ariaLabel,
    ariaDescribedBy,
    ...props
  }, ref) => {
    const skeletonRef = ref as React.RefObject<HTMLDivElement>;

    const baseClasses = cn(
      'rounded-[var(--radius-md)] bg-[var(--surface-overlay)]',
      animated && 'animate-pulse',
      className
    );

    const renderSkeleton = () => {
      switch (variant) {
        case 'text':
          return (
            <div className="space-y-3">
              {Array.from({ length: lines }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    sizeClasses[size],
                    height ? `h-[${height}]` : '',
                    width ? `w-[${width}]` : widthClasses[size]
                  )}
                />
              ))}
            </div>
          );

        case 'avatar':
          return (
            <div
              className={cn(
                'rounded-full bg-[var(--surface-overlay)]',
                size === 'sm' && 'w-8 h-8',
                size === 'md' && 'w-10 h-10',
                size === 'lg' && 'w-12 h-12'
              )}
            />
          );

        case 'button':
          return (
            <div
              className={cn(
                'inline-flex items-center justify-center rounded-[var(--radius-md)]',
                size === 'sm' && 'h-8 px-3',
                size === 'md' && 'h-10 px-4',
                size === 'lg' && 'h-12 px-6',
                width ? `w-[${width}]` : ''
              )}
            />
          );

        case 'card':
          return (
            <div className="space-y-4">
              <div
                className={cn(
                  'rounded-lg bg-[var(--surface-overlay)]',
                  height ? `h-[${height}]` : 'h-48'
                )}
              />
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-[var(--surface-overlay)] rounded" />
                <div className="h-4 w-1/2 bg-[var(--surface-overlay)] rounded" />
              </div>
            </div>
          );

        case 'image':
          return (
            <div
              className={cn(
                'bg-[var(--surface-overlay)] rounded-lg',
                size === 'sm' && 'w-16 h-16',
                size === 'md' && 'w-24 h-24',
                size === 'lg' && 'w-32 h-32',
                height ? `h-[${height}]` : '',
                width ? `w-[${width}]` : ''
              )}
            />
          );
      }
    };

    return (
      <div
        ref={skeletonRef}
        className={baseClasses}
        role="status"
        aria-busy={animated}
        aria-label={ariaLabel || 'Loading'}
        aria-describedby={ariaDescribedBy}
        {...props}
      >
        {animated && (
          <span className="sr-only">Loading...</span>
        )}
        {renderSkeleton()}
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * Skeleton wrapper component that shows skeleton while loading
 */
export const SkeletonWrapper = <T extends {}>({
  data,
  loading,
  children,
  fallback,
  skeletonProps,
}: {
  data: T | null | undefined;
  loading: boolean;
  children: React.ReactNode | ((data: T) => React.ReactNode);
  fallback?: React.ReactNode;
  skeletonProps?: SkeletonProps;
}) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        {fallback || <Skeleton variant="card" {...skeletonProps} />}
      </div>
    );
  }

  if (!data) {
    return fallback || null;
  }

  if (typeof children === 'function') {
    return children(data);
  }

  return children;
};

/**
 * Skeleton list component for consistent loading states
 */
export const SkeletonList = ({ count = 3, className }: { count?: number; className?: string }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-4 bg-[var(--surface-card)] rounded-lg border border-[var(--border-subtle)]">
          <div className="flex items-center space-x-4">
            <Skeleton variant="avatar" size="md" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" size="md" width="60%" />
              <Skeleton variant="text" size="sm" width="40%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton table component for data loading
 */
export const SkeletonTable = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={cn(
                'h-10 bg-[var(--surface-overlay)] rounded',
                colIndex === 0 && 'w-24',
                colIndex === 1 && 'flex-1',
                colIndex === 2 && 'w-32',
                colIndex === 3 && 'w-24'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
};