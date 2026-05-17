export function ServicesKpisSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-4 h-20 animate-pulse"
        />
      ))}
    </div>
  );
}

export function ServicesTableSkeleton() {
  return (
    <div className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md overflow-hidden">
      <div className="h-10 bg-[var(--surface-container-low)] border-b border-outline-variant" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-12 border-b border-outline-variant animate-pulse bg-[var(--surface-container-lowest)]"
        />
      ))}
    </div>
  );
}
