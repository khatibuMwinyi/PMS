export function FinancialsSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-5 h-28 animate-pulse"
        />
      ))}
    </div>
  );
}

export function InvoicesTableSkeleton() {
  return (
    <div className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md overflow-hidden">
      <div className="h-14 bg-[var(--surface-container-low)] border-b border-outline-variant" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-12 border-b border-outline-variant animate-pulse"
        />
      ))}
    </div>
  );
}
