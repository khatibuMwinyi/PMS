import React from 'react';

/**
 * Skeleton loader for the Provider dashboard while data is being fetched.
 * Matches the two‑column grid layout of the actual dashboard.
 */
export default function ProviderDashboardSkeleton() {
  const box = (
    <div className="animate-pulse bg-[var(--surface-card)] rounded-[var(--radius-md)] h-12 mb-2" />
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="p-4">{box}</div>
      <div className="p-4">{box}</div>
      <div className="p-4">{box}</div>
      <div className="p-4">{box}</div>
    </div>
  );
}
