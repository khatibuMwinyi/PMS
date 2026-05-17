export function MonthlySpendSkeleton() {
  return (
    <div className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-5 h-72 animate-pulse" />
  );
}

export function ServiceMixSkeleton() {
  return (
    <div className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-5 h-72 animate-pulse" />
  );
}

export function PropertyCostSkeleton() {
  return (
    <div className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md overflow-hidden">
      <div className="h-14 bg-[var(--surface-container-low)] border-b border-outline-variant" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-12 border-b border-outline-variant animate-pulse" />
      ))}
    </div>
  );
}
