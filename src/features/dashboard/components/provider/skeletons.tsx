function Box({ className = '' }: { className?: string }) {
  return <div className={`rounded animate-pulse bg-[var(--surface-overlay)] ${className}`} />;
}

export function KpiBentoSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 flex flex-col gap-3"
        >
          <Box className="h-3 w-20" />
          <Box className="h-8 w-32" />
          <Box className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function PipelineSkeleton() {
  return (
    <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--surface-card)] p-4 flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
        <Box key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}

export function UpcomingSkeleton() {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 flex flex-col gap-3">
      <Box className="h-4 w-48" />
      <Box className="h-16 w-full" />
    </div>
  );
}
