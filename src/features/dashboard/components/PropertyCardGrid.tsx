import Image from 'next/image';
import Link from 'next/link';
import { getDashboardProperties } from '@/features/dashboard/actions';

interface Property {
  id: string;
  name: string;
  type: string;
  address: string;
  units: number;
  occupancy: number;
  imageUrl?: string;
}

function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/owner/properties/${property.id}`}>
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] overflow-hidden transition-all duration-200 hover:border-[var(--brand-gold)] hover:shadow-md">
        <div className="relative h-32 w-full bg-[var(--border-subtle)] overflow-hidden">
          {property.imageUrl ? (
            <Image
              src={property.imageUrl}
              alt={property.name}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
              No Image
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-[var(--text-primary)]">{property.name}</h3>
          <span className="mt-1 inline-block rounded-full bg-[var(--border-subtle)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            {property.type}
          </span>
          <p className="mt-2 text-[var(--font-body-sm)] text-[var(--text-muted)]">
            {property.address}
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
            <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              {property.units} units
            </div>
            <span className="text-sm font-bold text-[var(--text-primary)]">
              {property.occupancy}% occupancy
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export async function PropertyCardGrid() {
  const properties = await getDashboardProperties();

  return (
    <div className="mb-6">
      <h2 className="mb-4 text-[var(--font-h2)] text-[var(--text-primary)]">Properties</h2>
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-[var(--text-muted)]">
          No properties yet. Add your first property to get started.
        </div>
      )}
    </div>
  );
}