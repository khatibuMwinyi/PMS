'use client';

import * as React from 'react';
import { Skeleton } from './Skeleton';

interface SkeletonWrapperProps<T> {
  data: T | undefined;
  loading: boolean;
  children: (data: T) => React.ReactNode;
  fallback?: React.ReactNode;
  skeletonCount?: number;
}

/**
 * Wrapper component that shows skeleton loading states when data is loading
 */
export function SkeletonWrapper<T>({
  data,
  loading,
  children,
  fallback,
  skeletonCount = 3,
}: SkeletonWrapperProps<T>) {
  if (loading) {
    return (
      <div className="space-y-4">
        {fallback || (
          <>
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <div key={index} className="p-4 border border-[var(--border-subtle)] rounded-lg">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </>
        )}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--text-muted)]">No data available</p>
      </div>
    );
  }

  return children(data);
}

/**
 * Grid skeleton wrapper for consistent grid layouts
 */
export function GridSkeletonWrapper<T>({
  data,
  loading,
  children,
  columns = 3,
  skeletonCount = 6,
}: SkeletonWrapperProps<T> & { columns?: number }) {
  if (loading) {
    return (
      <div
        className={`grid gap-4 grid-cols-1 md:grid-cols-${columns} lg:grid-cols-${columns}`}
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className="border border-[var(--border-subtle)] rounded-lg overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--text-muted)]">No data available</p>
      </div>
    );
  }

  return children(data);
}