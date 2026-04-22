import React from 'react';

/** Skeleton for Owner Analytics page */
export default function OwnerAnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-[var(--surface-card)] rounded animate-pulse" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-12 bg-[var(--surface-card)] rounded animate-pulse" />
      ))}
    </div>
  );
}
