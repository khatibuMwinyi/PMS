'use client';

import { useState, type ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => ReactNode;
  sortBy?: (row: T) => string | number;
  align?: 'left' | 'right' | 'center';
  width?: string;
  /** @deprecated Use align instead */
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyState?: ReactNode;
  onRowClick?: (row: T) => void;
  stickyHeader?: boolean;
  density?: 'compact' | 'comfortable';
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  loading,
  emptyState = 'No data.',
  onRowClick,
  stickyHeader = false,
  density = 'comfortable',
  className,
}: TableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);

  const sorted = (() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortBy) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = col.sortBy!(a);
      const bv = col.sortBy!(b);
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  })();

  const cellY = density === 'compact' ? 'py-2' : 'py-3';
  const cellX = 'px-4';

  return (
    <div className={cn('w-full overflow-x-auto rounded-lg border border-border-subtle bg-surface-card', className)}>
      <table className="w-full text-body">
        <thead className={cn('bg-surface-overlay', stickyHeader && 'sticky top-0 z-10')}>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  'text-caption uppercase text-text-muted text-left',
                  cellX,
                  cellY,
                  c.align && `text-${c.align}`,
                )}
                style={c.width ? { width: c.width } : undefined}
              >
                {c.sortBy ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-text-primary"
                    onClick={() =>
                      setSort((s) =>
                        s?.key === c.key
                          ? { key: c.key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
                          : { key: c.key, dir: 'asc' },
                      )
                    }
                  >
                    {c.header}
                    {sort?.key === c.key && (sort.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} data-testid="skeleton-row" className="border-t border-border-subtle">
                  {columns.map((c) => (
                    <td key={c.key} className={cn(cellX, cellY)}>
                      <div className="h-3 bg-surface-overlay rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            : sorted.length === 0
            ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-text-muted">
                  {emptyState}
                </td>
              </tr>
            )
            : sorted.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className={cn(
                    'border-t border-border-subtle transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-surface-overlay',
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn(cellX, cellY, c.align && `text-${c.align}`)}>
                      {c.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
