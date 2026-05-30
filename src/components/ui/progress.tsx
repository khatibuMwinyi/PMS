import { cn } from '@/lib/cn';

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('w-full bg-surface-overlay rounded-full h-2 overflow-hidden', className)}>
      <div
        className="h-full bg-accent rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
