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
    type?:            string;
    imageUrls:        string[];
    units:            { id: string }[];
    createdAt:        Date;
    status?:          string;
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  const firstImage = property.imageUrls?.[0];
  const unitCount  = property.units?.length ?? 0;

  return (
    <Card className="overflow-hidden flex flex-col border rounded-[var(--radius-lg)] transition-all duration-200 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-modal)]">

      {/* ── Property image (h-32, object-cover, hover:scale-105) ─────────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ height: '8rem' }}>
        {firstImage ? (
          <img
            src={firstImage}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center h-full gap-1.5"
            style={{ background: 'var(--surface-overlay)', color: 'var(--text-muted)' }}
          >
            <Home size={28} strokeWidth={1.5} />
            <span className="text-[var(--text-xs)]">No photo</span>
          </div>
        )}
      </div>

      <CardContent className="flex flex-col gap-3 p-4 flex-1">

        {/* Name (font-bold) + Type badge + Status badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[var(--font-h2)] font-bold text-[var(--text-primary)] leading-snug line-clamp-1">
            {property.name}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {property.status && (
              <StatusBadge status={property.status} className="text-[10px]" />
            )}
            {property.type && (
              <span
                className="px-2 py-0.5 rounded-[var(--radius-pill)] text-[10px] font-medium uppercase tracking-wider"
                style={{ background: 'var(--surface-overlay)', color: 'var(--text-secondary)' }}
              >
                {property.type}
              </span>
            )}
          </div>
        </div>

        {/* Zone badge (10px, uppercase) */}
        {property.zone && (
          <div className="flex items-center gap-1.5">
            <Tag size={11} style={{ color: 'var(--brand-primary)' }} />
            <span
              className="px-2 py-0.5 rounded-[var(--radius-pill)] text-[10px] font-medium uppercase"
              style={{ background: 'var(--success-bg)', color: 'var(--text-secondary)' }}
            >
              {property.zone}
            </span>
          </div>
        )}

        {/* Address (body-sm, on-surface-variant) */}
        <div className="flex items-center gap-1.5 text-[var(--text-13px)]" style={{ color: 'var(--text-secondary)' }}>
          <MapPin size={13} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
          <span className="line-clamp-1">{property.encryptedAddress}</span>
        </div>

        {/* Stats row: units icon + count, occupancy percentage (font-bold) */}
        <div
          className="flex items-center gap-4 py-2 px-3 rounded-[var(--radius-md)] text-[var(--text-13px)]"
          style={{ background: 'var(--surface-overlay)' }}
        >
          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Home size={13} style={{ color: 'var(--text-muted)' }} />
            <span>{unitCount} unit{unitCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="w-px h-3" style={{ background: 'var(--border-default)' }} />
          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Wrench size={13} style={{ color: 'var(--text-muted)' }} />
            <span className="font-bold">0% occupancy</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/owner/properties/${property.id}`}
          className="flex items-center justify-center h-9 rounded-[var(--radius-md)] border text-[var(--text-13px)] font-medium transition-all duration-120 mt-auto hover:bg-[var(--surface-overlay)]"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
        >
          View Details →
        </Link>

      </CardContent>
    </Card>
  );
}