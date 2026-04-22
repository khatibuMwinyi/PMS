import React from 'react';

/**
 * Simple skeleton loader for the Owner dashboard while data is being fetched.
 * Mirrors the grid structure of the actual dashboard, displaying animated placeholder boxes.
 */
export default function OwnerDashboardSkeleton() {
  const skeleton = (
    <div className="animate-pulse bg-[var(--surface-card)] rounded-[var(--radius-md)] h-12 mb-2" />
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="p-4">
        {skeleton}
      </div>
      <div className="p-4">
        {skeleton}
      </div>
      <div className="p-4">
        {/* For the list of recent tasks, show a few line skeletons */}
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-[var(--surface-card)] rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
