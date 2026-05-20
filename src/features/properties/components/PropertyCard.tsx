import Link from 'next/link';
import { MapPin, Home } from 'lucide-react';

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
  const isActive   = property.status === 'ACTIVE';

  return (
    <Link
      href={`/owner/properties/${property.id}`}
      className="group block rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-bold)] hover:-translate-y-1"
    >
      {/* ── Hero image ─────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {firstImage ? (
          <img
            src={firstImage}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(145deg, var(--brand-primary) 0%, #1e3a5f 100%)' }}
          >
            <Home size={40} strokeWidth={0.9} style={{ color: 'rgba(255,255,255,0.18)' }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.28)' }}
            >
              No Photo
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(13,18,38,0.88) 0%, rgba(13,18,38,0.18) 52%, transparent 100%)' }}
        />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {property.status && (
            <span
              className="px-2.5 py-0.5 rounded-[var(--radius-pill)] text-[9px] font-bold uppercase tracking-wider"
              style={{
                background: isActive ? 'rgba(16,185,129,0.92)' : 'rgba(100,116,139,0.88)',
                color: '#fff',
                backdropFilter: 'blur(8px)',
              }}
            >
              {property.status}
            </span>
          )}
          {property.zone && (
            <span
              className="px-2.5 py-0.5 rounded-[var(--radius-pill)] text-[9px] font-semibold uppercase tracking-wider"
              style={{ background: 'rgba(240,165,0,0.90)', color: '#131b2e', backdropFilter: 'blur(8px)' }}
            >
              {property.zone}
            </span>
          )}
        </div>

        {/* Name + address overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-2">
          <h3
            className="text-[16px] leading-tight font-semibold text-white mb-1 line-clamp-1"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {property.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <MapPin size={10} style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
            <span className="text-[11px] line-clamp-1" style={{ color: 'rgba(255,255,255,0.62)' }}>
              {property.encryptedAddress}
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom strip ───────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Home size={12} style={{ color: 'var(--text-muted)' }} />
            <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {unitCount} {unitCount === 1 ? 'unit' : 'units'}
            </span>
          </div>
          {property.type && (
            <>
              <div className="w-px h-3" style={{ background: 'var(--border-default)' }} />
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                {property.type}
              </span>
            </>
          )}
        </div>
        <span
          className="text-[11px] font-semibold tracking-wide transition-colors duration-200 group-hover:text-[var(--brand-gold)]"
          style={{ color: 'var(--text-muted)' }}
        >
          View →
        </span>
      </div>
    </Link>
  );
}
