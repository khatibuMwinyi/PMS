import { Suspense } from 'react';
import type { Metadata } from 'next';
import { listOwnerAgreements } from '@/features/agreements/actions';
import { AgreementList } from '@/features/agreements/components/AgreementList';
import { ErrorBoundaryWrapper } from '@/components/ui/ErrorBoundary';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { auth } from '@/core/auth';

export const metadata: Metadata = { title: 'My Agreements — Oweru' };

async function AgreementsContent() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  const agreements = await listOwnerAgreements(session.user.id);
  
  return (
    <div>
      {agreements.length > 0 ? (
        <AgreementList 
          agreements={agreements.map((a: any) => ({
            id: a.id,
            quoteId: a.quoteId,
            quotedPrice: a.quotedPrice.toString(),
            status: a.status as any,
            propertyName: a.propertyName,
            createdAt: a.createdAt.toISOString(),
            formattedDate: a.createdAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            isImmutable: a.isImmutable,
          }))}
          onView={(id) => {
            window.location.href = `/owner/agreements/${id}`;
          }}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-[var(--text-muted)] mb-4">No agreements yet</p>
          <Link href="/owner/quotes">
            <Button variant="primary">
              View Quotes to Accept
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function OwnerAgreementsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      
      {/* ── Page header ───────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-semibold text-[var(--text-primary)] leading-tight">
            My Agreements
          </h1>
          <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            View and manage your service agreements
          </p>
        </div>

        {/* Link to quotes page to create new agreement */}
        <Link href="/owner/quotes">
          <Button variant="outline">
            View Quotes
          </Button>
        </Link>
      </div>

      {/* ── Agreement list with Suspense and Error boundaries ─────────────── */}
      <Suspense fallback={<div className="h-32 flex items-center justify-center">Loading agreements...</div>}>
        <ErrorBoundaryWrapper>
          <AgreementsContent />
        </ErrorBoundaryWrapper>
      </Suspense>

    </div>
  );
}
