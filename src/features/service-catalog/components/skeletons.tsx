export function ServiceCatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-5 h-44 animate-pulse"
        />
      ))}
    </div>
  );
}
