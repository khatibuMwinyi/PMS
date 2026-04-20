import Link from 'next/link';
import { MapPin, Home, Wrench, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface PropertyCardProps {
  property: {
    id:               string;
    name:             string;
    encryptedAddress: string;
    zone:             string;
    imageUrls:        string[];
    units:            { id: string }[];
    createdAt:        Date;
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  const firstImage = property.imageUrls?.[0];
  const unitCount  = property.units?.length ?? 0;

  return (
    <Card className="overflow-hidden flex flex-col transition-all duration-200 hover:shadow-[var(--shadow-modal)] hover:-translate-y-0.5">

      {/* ── Property image ───────────────────────────────────── */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{ aspectRatio: '16/9', background: 'var(--surface-overlay)' }}
      >
        {firstImage ? (
          <img
            src={firstImage}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="flex flex-col items-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <Home size={28} strokeWidth={1.5} />
            <span className="text-[12px]">No photo</span>
          </div>
        )}
      </div>

      <CardContent className="flex flex-col gap-3 flex-1">

        {/* Name + status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)] leading-snug line-clamp-1">
            {property.name}
          </h3>
          <StatusBadge status="ACTIVE" className="shrink-0 mt-0.5" />
        </div>

        {/* Zone badge — shown to providers */}
        <div className="flex items-center gap-1.5 text-[12px]">
          <Tag size={11} style={{ color: 'var(--brand-primary)' }} />
          <span
            className="px-2 py-0.5 rounded-pill font-medium"
            style={{ background: '#e8f7f2', color: 'var(--brand-primary-dim)' }}
          >
            {property.zone}
          </span>
        </div>

        {/* Address — full version (owner-visible only) */}
        <div className="flex items-center gap-1.5 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          <MapPin size={13} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
          <span className="line-clamp-1">{property.encryptedAddress}</span>
        </div>

        {/* Stats row */}
        <div
          className="flex items-center gap-4 py-2.5 px-3 rounded-[var(--radius-md)] text-[13px]"
          style={{ background: 'var(--surface-overlay)' }}
        >
          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Home size={13} style={{ color: 'var(--text-muted)' }} />
            <span>{unitCount} unit{unitCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="w-px h-3" style={{ background: 'var(--border-default)' }} />
          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Wrench size={13} style={{ color: 'var(--text-muted)' }} />
            <span>0 active services</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/owner/properties/${property.id}`}
          className="flex items-center justify-center h-9 rounded-[var(--radius-md)] border text-[13px] font-medium transition-all duration-120 mt-auto hover:bg-[var(--surface-overlay)]"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
        >
          View Details →
        </Link>

      </CardContent>
    </Card>
  );
}