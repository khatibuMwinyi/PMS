// src/features/dashboard/components/owner/skeletons.tsx
export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 h-[120px] animate-pulse"
        >
          <div className="h-3 w-24 bg-[var(--border-subtle)] rounded mb-3" />
          <div className="h-7 w-32 bg-[var(--border-subtle)] rounded mt-6" />
        </div>
      ))}
    </div>
  );
}

export function PropertiesPanelSkeleton() {
  return (
    <div>
      <div className="h-5 w-40 bg-[var(--border-subtle)] rounded mb-4 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] h-[200px] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export function RequestsPanelSkeleton() {
  return (
    <div>
      <div className="h-5 w-32 bg-[var(--border-subtle)] rounded mb-4 animate-pulse" />
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="p-4 border-b border-[var(--border-subtle)] last:border-b-0 h-[80px] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
