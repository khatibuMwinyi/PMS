import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getQuoteDetails } from '@/features/quotes/actions';
import { QuoteCard } from '@/features/quotes/components/QuoteCard';
import { ErrorBoundaryWrapper } from '@/components/ui/ErrorBoundary';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Decimal } from 'decimal.js';

interface QuoteDetailPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = { title: 'Quote Details — Oweru' };

async function QuoteDetailContent({ quoteId }: { quoteId: string }) {
  const quote = await getQuoteDetails(quoteId);
  
  if (!quote) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-muted)] mb-4">Quote not found</p>
        <Link href="/owner/quotes">
          <Button variant="outline">
            Back to Quotes
          </Button>
        </Link>
      </div>
    );
  }

  const quotedPrice = new Decimal(quote.quotedPrice);
  const isExpired = quote.priceLockedUntil 
    ? new Date() > quote.priceLockedUntil 
    : false;

  const unitCount = quote.unitCount ?? 1;
  const frequencyMultiplier =
    quote.frequency === 'WEEKLY' ? 0.9 :
    quote.frequency === 'BIWEEKLY' ? 0.95 :
    quote.frequency === 'MONTHLY' ? 1.0 :
    1.0;

  const basePrice = new Decimal(Number(quote.serviceType.basePrice));
  const denom = basePrice.times(frequencyMultiplier).times(unitCount);
  const locationFactor = denom.isZero()
    ? new Decimal(1)
    : quotedPrice.div(denom);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Quote Details Card */}
      <div className="bg-[var(--surface-card)] p-6 rounded-2xl shadow-card border border-[var(--border-default)]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              {quote.property.name}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              {quote.serviceType.name}
            </p>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            quote.status === 'QUOTED' ? 'bg-blue-100 text-blue-700' :
            quote.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
            quote.status === 'EXPIRED' ? 'bg-gray-100 text-gray-700' :
            'bg-gray-50 text-gray-600'
          }`}>
            {quote.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-[var(--text-muted)] mb-1">Quoted Price</p>
            <p className="text-3xl font-bold text-[var(--brand-primary)] tabular-nums">
              ${quotedPrice.toFixed(2)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-[var(--text-muted)] mb-1">Status</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              {quote.status}
            </p>
            {quote.priceLockedUntil && !isExpired && (
              <p className="text-xs text-[var(--state-warning)] mt-1">
                🔒 Price locked until {new Date(quote.priceLockedUntil).toLocaleString()}
              </p>
            )}
            {isExpired && (
              <p className="text-xs text-[var(--state-error)] mt-1">
                ⚠️ Quote expired
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--border-default)] pt-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Price Breakdown
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-[var(--text-muted)]">Base Price</span>
              <span className="text-sm tabular-nums text-[var(--text-primary)]">
                ${quote.serviceType.basePrice.toString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--text-muted)]">Location Factor</span>
              <span className="text-sm tabular-nums text-[var(--text-primary)]">
                {locationFactor.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--text-muted)]">Frequency Multiplier</span>
              <span className="text-sm tabular-nums text-[var(--text-primary)]">
                {frequencyMultiplier.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--text-muted)]">Unit Count</span>
              <span className="text-sm tabular-nums text-[var(--text-primary)]">
                {unitCount}
              </span>
            </div>
            <div className="flex justify-between font-semibold border-t border-[var(--border-default)] pt-2">
              <span>Total</span>
              <span className="tabular-nums text-[var(--brand-primary)]">
                ${quotedPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--border-default)]">
          {quote.status === 'QUOTED' && !isExpired && (
            <Button variant="primary">
              Accept Quote
            </Button>
          )}
          <Link href="/owner/quotes">
            <Button variant="outline">
              Back to List
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      
      {/* ── Page header ────────────────────────────── */}
      <div className="flex items-start gap-4">
        <Link 
          href="/owner/quotes" 
          className="mt-1 p-2 hover:bg-[var(--surface-overlay)] rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-[var(--text-muted)]" />
        </Link>
        <div>
          <h1 className="text-h2 font-semibold text-[var(--text-primary)] leading-tight">
            Quote Details
          </h1>
          <p className="text-body-sm mt-0.5 text-[var(--text-secondary)]">
            View quote details and price breakdown
          </p>
        </div>
      </div>

      {/* ── Quote detail with Suspense and Error boundaries ─────── */}
      <Suspense fallback={<div className="h-32 flex items-center justify-center">Loading quote details...</div>}>
        <ErrorBoundaryWrapper>
          <QuoteDetailContent quoteId={params.id} />
        </ErrorBoundaryWrapper>
      </Suspense>

    </div>
  );
}
