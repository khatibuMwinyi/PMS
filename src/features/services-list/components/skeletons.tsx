// src/features/services-list/components/skeletons.tsx
export function ServicesKpisSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-md p-4 h-[76px] animate-pulse"
          style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--outline-variant)' }}
        />
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
