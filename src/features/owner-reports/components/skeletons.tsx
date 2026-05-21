// src/features/owner-reports/components/skeletons.tsx
export function MonthlySpendSkeleton() {
  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg shadow-card p-5 h-72 animate-pulse" />
  );
}

export function ServiceMixSkeleton() {
  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg shadow-card p-5 h-72 animate-pulse" />
  );
}

export function PropertyCostSkeleton() {
  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg shadow-card overflow-hidden">
      <div className="h-12 border-b border-border-subtle bg-surface-overlay animate-pulse" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-12 border-b border-border-subtle last:border-b-0 animate-pulse bg-surface-overlay/50"
        />
      ))}
    </div>
  );
}
