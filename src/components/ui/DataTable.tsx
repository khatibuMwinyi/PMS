import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  className = '',
  emptyMessage = 'No data available.',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]">
        <p className="text-sm text-[var(--text-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-[var(--space-3)] py-[var(--space-2)] text-left text-[var(--font-table-header)] text-[var(--on-surface-variant)] ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              className="border-b border-[var(--border-subtle)] transition-colors duration-120 hover:bg-[var(--surface-100)]"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-[var(--space-3)] py-[var(--space-2)] text-[var(--font-data-tabular)] text-[var(--text-primary)] ${column.className || ''}`}
                >
                  {column.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
