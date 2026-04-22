import React from 'react';

/** Skeleton placeholder for Provider Wallet page */
export default function ProviderWalletSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="h-8 bg-[var(--surface-card)] rounded animate-pulse" />
      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-12 bg-[var(--surface-card)] rounded animate-pulse" />
        ))}
      </div>
      {/* Transactions list */}
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 bg-[var(--surface-card)] rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
