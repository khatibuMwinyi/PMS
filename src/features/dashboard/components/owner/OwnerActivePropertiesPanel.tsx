// src/features/dashboard/components/owner/OwnerActivePropertiesPanel.tsx
import Image from 'next/image';
import Link from 'next/link';
import { getOwnerActiveProperties } from '@/features/dashboard/queries/owner';
import type { OwnerPropertyCard } from '@/features/dashboard/schemas/owner-dashboard.schema';

interface Props {
  ownerUserId: string;
  limit?: number;
}

function PropertyTile({ p }: { p: OwnerPropertyCard }) {
  return (
    <Link
      href={p.hrefDetail}
      className="block rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] overflow-hidden hover:border-[var(--brand-gold)] transition-colors"
    >
      <div className="relative h-32 w-full bg-[var(--border-subtle)] overflow-hidden">
        {p.imageUrl ? (
          <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
            No image
          </div>
        )}
        {p.isActive && (
          <span className="absolute top-2 right-2 bg-[var(--state-success)]/10 text-[var(--state-success)] text-[10px] font-medium uppercase px-2 py-1 rounded">
            Active
          </span>
        )}
      </div>
      <div className="p-4">
        <h4 className="text-[16px] font-semibold text-[var(--text-primary)] mb-1">{p.name}</h4>
        <p className="text-body-sm text-[var(--text-secondary)] mb-3">{p.addressLine}</p>
        <div className="grid grid-cols-2 gap-2 border-t border-[var(--border-subtle)] pt-3">
          <div>
            <span className="block text-[10px] uppercase text-[var(--text-muted)]">Occupancy</span>
            <span className="text-body-sm font-semibold text-[var(--text-primary)]">{p.occupancyPct}%</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-[var(--text-muted)]">Units</span>
            <span className="text-body-sm font-semibold text-[var(--text-primary)]">{p.unitCount} Total</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ActivePropertiesEmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 text-center">
      <p className="text-body-sm text-[var(--text-muted)] mb-3">No active properties yet.</p>
      <a
        href="/owner/properties/new"
        className="inline-block rounded bg-[var(--brand-gold)] px-4 py-2 text-sm font-medium text-[var(--brand-primary)]"
      >
        Add your first property
      </a>
    </div>
  );
}

export async function OwnerActivePropertiesPanel({ ownerUserId, limit = 4 }: Props) {
  const properties = await getOwnerActiveProperties(ownerUserId, limit);

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-h2 font-semibold text-[var(--text-primary)]">Active Properties</h3>
        <Link href="/owner/properties" className="text-label text-[var(--brand-gold)] hover:underline">
          View All
        </Link>
      </div>
      {properties.length === 0 ? (
        <ActivePropertiesEmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((p) => <PropertyTile key={p.id} p={p} />)}
        </div>
      )}
    </section>
  );
}
