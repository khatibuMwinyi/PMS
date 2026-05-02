import { QuoteRequestForm } from '@/features/quotes/components/QuoteRequestForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewQuotePage() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      
      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <Link 
          href="/owner/quotes" 
          className="mt-1 p-2 hover:bg-[var(--surface-overlay)] rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-[var(--text-muted)]" />
        </Link>
        <div>
          <h1 className="text-[20px] font-semibold text-[var(--text-primary)] leading-tight">
            Request a New Quote
          </h1>
          <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Select your property and service type to get a quoted price
          </p>
        </div>
      </div>

      {/* ── Quote Request Form ────────────────────────── */}
      <QuoteRequestForm 
        ownerId="" // TODO: Get from session
        onSuccess={(quoteId) => {
          window.location.href = `/owner/quotes/${quoteId}`;
        }}
      />

    </div>
  );
}
