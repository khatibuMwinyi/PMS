// src/shared/components/ui/Pagination.tsx
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  basePath: string;
  currentPage: number;
  totalPages: number;
  /** Other URL params to preserve in Prev/Next links. */
  otherParams: Record<string, string>;
}

function buildHref(basePath: string, params: Record<string, string>, page: number): string {
  const url = new URLSearchParams(params);
  url.set('page', String(page));
  return `${basePath}?${url.toString()}`;
}

export function Pagination({ basePath, currentPage, totalPages, otherParams }: Props) {
  if (totalPages <= 1) return null;
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;
  const prevHref = prevDisabled ? '#' : buildHref(basePath, otherParams, currentPage - 1);
  const nextHref = nextDisabled ? '#' : buildHref(basePath, otherParams, currentPage + 1);

  const linkCls = (disabled: boolean) =>
    cn(
      'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-caption font-semibold border transition-colors',
      disabled
        ? 'border-border-subtle text-text-muted pointer-events-none opacity-50'
        : 'border-border-subtle text-text-primary hover:bg-surface-overlay',
    );

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 px-4 py-3 border-t border-border-subtle"
    >
      <Link href={prevHref} aria-disabled={prevDisabled} className={linkCls(prevDisabled)} aria-label="Previous page">
        <ChevronLeft size={14} /> Previous
      </Link>
      <span className="text-caption text-text-muted tabular-nums">
        Page {currentPage} of {totalPages}
      </span>
      <Link href={nextHref} aria-disabled={nextDisabled} className={linkCls(nextDisabled)} aria-label="Next page">
        Next <ChevronRight size={14} />
      </Link>
    </nav>
  );
}
