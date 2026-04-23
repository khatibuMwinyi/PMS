import { Suspense }            from 'react';
import type { Metadata }       from 'next';
import { getOwnerProperties }  from '@/features/properties/queries';
import { PropertyGrid }        from '@/features/properties/components/PropertyGrid';
import { PropertyGridSkeleton } from '@/features/properties/components/PropertyCardSkeleton';
import { AddPropertyButton }   from '@/features/properties/components/AddPropertyButton';
import { ErrorBoundaryWrapper } from '@/components/ui/ErrorBoundary';

export const metadata: Metadata = { title: 'My Properties — Oweru' };

async function PropertiesContent() {
  const properties = await getOwnerProperties();
  return <PropertyGrid properties={properties} />;
}

export default function OwnerPropertiesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-semibold text-[var(--text-primary)] leading-tight">
            My Properties
          </h1>
          <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Manage and monitor all your listed properties
          </p>
        </div>

        {/* Client component — triggers slide-over panel */}
        <AddPropertyButton />
      </div>

      {/* ── Property grid with Suspense and Error boundaries ─────────────── */}
      <Suspense fallback={<PropertyGridSkeleton />}>
        <ErrorBoundaryWrapper onRetry={() => window.location.reload()}>
          <PropertiesContent />
        </ErrorBoundaryWrapper>
      </Suspense>

    </div>
  );
}