import React from 'react';

/** Skeleton placeholder for Owner Services page */
export default function OwnerServicesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)] animate-pulse h-24" />
      ))}
    </div>
  );
}
