import { auth } from '@/core/auth';
import { prisma } from '@/core/database/client';
import { getAllServiceTypes } from '@/lib/api/services';
import { QuoteRequestForm } from '@/features/quotes/components/QuoteRequestForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function NewQuotePage() {
  const session = await auth();
  const ownerId = session?.user?.id ?? '';

  const ownerProfile = ownerId
    ? await prisma.ownerProfile.findUnique({ where: { userId: ownerId } })
    : null;

  const properties = ownerProfile
    ? await prisma.property.findMany({
        where: { ownerId: ownerProfile.id },
        select: { id: true, name: true, zone: true },
      })
    : [];

  const rawServiceTypes = await getAllServiceTypes();
  const serviceTypes = rawServiceTypes.map((st) => ({
    id: st.id,
    name: st.name,
    basePrice: Number(st.basePrice),
  }));

  return (
    <div className="flex flex-col gap-6 max-w-6xl">

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

      <QuoteRequestForm
        ownerId={ownerId}
        properties={properties}
        serviceTypes={serviceTypes}
        onSuccess={(quoteId) => {
          window.location.href = `/owner/quotes/${quoteId}`;
        }}
      />

    </div>
  );
}
