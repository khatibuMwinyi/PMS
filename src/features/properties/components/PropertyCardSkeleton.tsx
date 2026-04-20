export function PropertyCardSkeleton() {
  return (
    <div
      className="rounded-[var(--radius-lg)] border overflow-hidden"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-card)' }}
    >
      {/* Image skeleton */}
      <div
        className="w-full animate-pulse-skeleton"
        style={{ aspectRatio: '16/9', background: 'var(--surface-overlay)' }}
      />

      {/* Content skeleton */}
      <div className="p-6 flex flex-col gap-3">
        {/* Name + badge */}
        <div className="flex items-center justify-between gap-3">
          <div
            className="h-4 rounded-md animate-pulse-skeleton flex-1 max-w-[60%]"
            style={{ background: 'var(--surface-overlay)' }}
          />
          <div
            className="h-5 w-14 rounded-pill animate-pulse-skeleton"
            style={{ background: 'var(--surface-overlay)' }}
          />
        </div>

        {/* Address */}
        <div
          className="h-3.5 rounded-md animate-pulse-skeleton w-[75%]"
          style={{ background: 'var(--surface-overlay)' }}
        />

        {/* Stats bar */}
        <div
          className="h-10 rounded-[var(--radius-md)] animate-pulse-skeleton"
          style={{ background: 'var(--surface-overlay)' }}
        />

        {/* Button */}
        <div
          className="h-9 rounded-[var(--radius-md)] animate-pulse-skeleton"
          style={{ background: 'var(--surface-overlay)' }}
        />
      </div>
    </div>
  );
}

export function PropertyGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {[1, 2, 3].map((i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}