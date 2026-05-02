import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/core/lib/utils';

interface Property {
  id: string;
  name: string;
  type: string;
  address: string;
  units: number;
  occupancy: number;
  imageUrl?: string;
}

interface PropertyCardGridProps {
  properties?: Property[];
}

const defaultProperties: Property[] = [
  {
    id: '1',
    name: 'The Heights',
    type: 'RESIDENTIAL',
    address: '123 Main St, Cityville',
    units: 24,
    occupancy: 92,
    imageUrl: '/images/properties/the-heights.jpg',
  },
  {
    id: '2',
    name: 'Ironwood',
    type: 'COMMERCIAL',
    address: '456 Oak Ave, Townsville',
    units: 12,
    occupancy: 85,
    imageUrl: '/images/properties/ironwood.jpg',
  },
  {
    id: '3',
    name: 'Nexus',
    type: 'RESIDENTIAL',
    address: '789 Pine Rd, Villagetown',
    units: 36,
    occupancy: 78,
    imageUrl: '/images/properties/nexus.jpg',
  },
];

function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/owner/properties/${property.id}`}>
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] overflow-hidden transition-all duration-200 hover:border-[var(--brand-gold)] hover:shadow-md">
        {/* Property Image */}
        <div className="relative h-32 w-full bg-[var(--surface-200)] overflow-hidden">
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

        {/* Property Details */}
        <div className="p-4">
          <h3 className="font-bold text-[var(--text-primary)]">{property.name}</h3>
          <span className="mt-1 inline-block rounded-full bg-[var(--surface-200)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            {property.type}
          </span>
          <p className="mt-2 text-[var(--font-body-sm)] text-[var(--on-surface-variant)]">
            {property.address}
          </p>

          {/* Footer */}
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

export function PropertyCardGrid({ properties = defaultProperties }: PropertyCardGridProps) {
  return (
    <div className="mb-6">
      <h2 className="mb-4 text-[var(--font-h2)] text-[var(--text-primary)]">Properties</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
