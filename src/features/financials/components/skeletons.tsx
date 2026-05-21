export function FinancialsSummarySkeleton() {
  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden bg-surface-card shadow-card mb-6 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-5 h-24 animate-pulse bg-surface-overlay" />
      ))}
    </div>
  );
}

export function InvoicesTableSkeleton() {
  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg overflow-hidden shadow-card">
      <div className="px-5 py-3 border-b border-border-subtle h-14 animate-pulse bg-surface-overlay" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-14 border-b border-border-subtle last:border-b-0 animate-pulse bg-surface-overlay/50"
        />
      ))}
    </div>
  );
}
