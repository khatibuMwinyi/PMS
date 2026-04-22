import React from 'react';

/** Skeleton for Provider Tasks page */
export default function ProviderTasksSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)] animate-pulse h-12" />
      ))}
    </div>
  );
}
