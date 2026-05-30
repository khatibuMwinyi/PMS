// src/features/services-list/components/skeletons.tsx
export function ServicesKpisSkeleton() {
  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden bg-surface-card shadow-card grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border-t-[3px] border-t-border-subtle p-5 h-[92px] animate-pulse" />
      ))}
    </div>
  );
}

export function ServicesTableSkeleton() {
  return (
    <div
      className="bg-white border border-[var(--outline-variant)] rounded-lg overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}
    >
      <div className="h-11 bg-[var(--surface-container-lowest)] border-b-2 border-[var(--outline-variant)]" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-[52px] border-b border-[var(--outline-variant)] animate-pulse bg-[var(--surface-container-lowest)] last:border-0"
        />
      ))}
    </div>
  );
}
