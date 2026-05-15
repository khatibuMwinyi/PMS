import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAgreementDetails } from '@/features/agreements/actions';
import { AgreementCard } from '@/features/agreements/components/AgreementCard';
import { ErrorBoundaryWrapper } from '@/components/ui/ErrorBoundary';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Decimal } from 'decimal.js';

interface AgreementDetailPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = { title: 'Agreement Details — Oweru' };

async function AgreementDetailContent({ agreementId }: { agreementId: string }) {
  const agreement = await getAgreementDetails(agreementId);
  
  if (!agreement) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-muted)] mb-4">Agreement not found</p>
        <Link href="/owner/agreements">
          <Button variant="outline">
            Back to Agreements
          </Button>
        </Link>
      </div>
    );
  }

  const quotedPrice = new Decimal(agreement.quotedPrice);
  const isImmutable = agreement.status !== 'QUOTED';

  return (
    <div className="max-w-4xl space-y-6">
      {/* Agreement Details Card */}
      <div className="bg-[var(--surface-card)] p-6 rounded-2xl shadow-card border border-[var(--border-default)]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              {agreement.quote.property.name}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              {agreement.quote.serviceType.name}
            </p>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            agreement.status === 'QUOTED' ? 'bg-blue-100 text-blue-700' :
            agreement.status === 'PENDING_ASSIGNMENT' ? 'bg-green-100 text-green-700' :
            agreement.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
            agreement.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
            agreement.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
            'bg-gray-50 text-gray-600'
          }`}>
            {agreement.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-[var(--text-muted)] mb-1">Quoted Price</p>
            <p className="text-3xl font-bold text-[var(--brand-primary)] font-data-tabular">
              ${quotedPrice.toFixed(2)}
            </p>
            {isImmutable && (
              <p className="text-xs text-[var(--state-warning)] mt-1">
                🔒 Price is immutable after submission
              </p>
            )}
          </div>
          
          <div>
            <p className="text-sm text-[var(--text-muted)] mb-1">Status</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              {agreement.status}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Created: {new Date(agreement.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="border-t border-[var(--border-default)] pt-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Agreement Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-[var(--text-muted)]">Quote ID</span>
              <span className="text-sm font-data-tabular text-[var(--text-primary)]">
                {agreement.quoteId.slice(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--text-muted)]">Property</span>
              <span className="text-sm font-data-tabular text-[var(--text-primary)]">
                {agreement.quote.property.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--text-muted)]">Service Type</span>
              <span className="text-sm font-data-tabular text-[var(--text-primary)]">
                {agreement.quote.serviceType.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--text-muted)]">Original Base Price</span>
              <span className="text-sm font-data-tabular text-[var(--text-primary)]">
                ${agreement.quote.serviceType.basePrice.toString()}
              </span>
            </div>
            <div className="flex justify-between font-semibold border-t border-[var(--border-default)] pt-2">
              <span>Immutable Quoted Price</span>
              <span className="font-data-tabular text-[var(--brand-primary)]">
                ${quotedPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--border-default)]">
          {agreement.status === 'QUOTED' && (
            <Button 
              variant="primary"
              onClick={async () => {
                // Server action to submit agreement
                // This would call submitAgreement(agreement.id)
                // For now, redirect to agreements list
                window.location.href = '/owner/agreements';
              }}
            >
              Submit Agreement
            </Button>
          )}
          <Link href="/owner/agreements">
            <Button variant="outline">
              Back to List
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AgreementDetailPage({ params }: AgreementDetailPageProps) {
  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      
      {/* ── Page header ────────────────────────────── */}
      <div className="flex items-start gap-4">
        <Link 
          href="/owner/agreements" 
          className="mt-1 p-2 hover:bg-[var(--surface-overlay)] rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-[var(--text-muted)]" />
        </Link>
        <div>
          <h1 className="text-[20px] font-semibold text-[var(--text-primary)] leading-tight">
            Agreement Details
          </h1>
          <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            View agreement details with immutable quoted price
          </p>
        </div>
      </div>

      {/* ── Agreement detail with Suspense and Error boundaries ─────── */}
      <Suspense fallback={<div className="h-32 flex items-center justify-center">Loading agreement details...</div>}>
        <ErrorBoundaryWrapper>
          <AgreementDetailContent agreementId={params.id} />
        </ErrorBoundaryWrapper>
      </Suspense>

    </div>
  );
}
