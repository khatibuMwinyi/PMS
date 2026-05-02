import { cn } from '@/core/lib/utils';

export type StatusType = 'URGENT' | 'IN PROGRESS' | 'SCHEDULED' | 'COMPLETED' | 'DRAFT' | 'QUOTED' | 'ACCEPTED' | 'EXPIRED';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { bg: string; text: string; label: string }> = {
  'URGENT': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'URGENT',
  },
  'IN PROGRESS': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    label: 'IN PROGRESS',
  },
  'SCHEDULED': {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    label: 'SCHEDULED',
  },
  'COMPLETED': {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    label: 'COMPLETED',
  },
  'DRAFT': {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    label: 'DRAFT',
  },
  'QUOTED': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    label: 'QUOTED',
  },
  'ACCEPTED': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'ACCEPTED',
  },
  'EXPIRED': {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    label: 'EXPIRED',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig['DRAFT'];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  );
}
