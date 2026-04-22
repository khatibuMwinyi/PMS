import React from 'react';

/** Skeleton loader for Provider Ratings page */
export default function ProviderRatingsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)] animate-pulse h-12" />
      ))}
    </div>
  );
}
