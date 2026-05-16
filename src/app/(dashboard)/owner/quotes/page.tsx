import { Suspense } from 'react';
import type { Metadata } from 'next';
import { listOwnerQuotes } from '@/features/quotes/actions';
import { QuoteList } from '@/features/quotes/components/QuoteList';
import { ErrorBoundaryWrapper } from '@/components/ui/ErrorBoundary';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { auth } from '@/core/auth';

export const metadata: Metadata = { title: 'My Quotes — Oweru' };

async function QuotesContent() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  const quotes = await listOwnerQuotes(session.user.id);
  
  return (
    <div>
      {quotes.length > 0 ? (
        <QuoteList 
          quotes={quotes.map((q: any) => ({
            id: q.id,
            propertyName: q.propertyName,
            serviceTypeName: q.serviceTypeName,
            quotedPrice: q.quotedPrice.toString(),
            status: q.status as any,
            formattedDate: q.createdAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            isLocked: q.isLocked,
            isExpired: q.isExpired,
          }))}
          onView={(id) => {}}
          onAccept={(id) => {}}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-[var(--text-muted)] mb-4">No quotes yet</p>
          <Link href="/owner/quotes/new">
            <Button variant="primary">
              Request Your First Quote
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function OwnerQuotesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      
      {/* ── Page header ───────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-semibold text-[var(--text-primary)] leading-tight">
            My Quotes
          </h1>
          <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            View and manage your service quotes
          </p>
        </div>

        {/* Link to request new quote */}
        <Link href="/owner/quotes/new">
          <Button variant="primary">
            Request Quote
          </Button>
        </Link>
      </div>

      {/* ── Quote list with Suspense and Error boundaries ─────────────── */}
      <Suspense fallback={<div className="h-32 flex items-center justify-center">Loading quotes...</div>}>
        <ErrorBoundaryWrapper>
          <QuotesContent />
        </ErrorBoundaryWrapper>
      </Suspense>

    </div>
  );
}
