import { MapPin, Home, Wrench, Tag, Calendar, Activity, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { updatePropertyStatus } from '@/features/properties/actions';

interface PropertyDetailProps {
  property: {
    id:               string;
    name:             string;
    encryptedAddress: string;
    zone:             string;
    type?:            string;
    status:           string;
    imageUrls:        string[];
    units:            { id: string; unitName: string; unitType: string }[];
    createdAt:        Date;
    updatedAt:        Date;
    _count?: {
      quotes:     number;
      agreements: number;
    };
  };
  isOwner: boolean;
}

export function PropertyDetail({ property, isOwner }: PropertyDetailProps) {
  const firstImage = property.imageUrls?.[0];
  const unitCount  = property.units?.length ?? 0;
  const isActive   = property.status === 'ACTIVE';

  return (
    <div className="flex flex-col gap-5 max-w-5xl">

      {/* ── Hero image ──────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden rounded-[var(--radius-xl)]"
        style={{ aspectRatio: '16/7' }}
      >
        {firstImage ? (
          <img
            src={firstImage}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-3"
            style={{ background: 'linear-gradient(145deg, var(--brand-primary) 0%, #1e3a5f 100%)' }}
          >
            <Building2 size={64} strokeWidth={0.7} style={{ color: 'rgba(255,255,255,0.12)' }} />
            <span
              className="text-[12px] font-semibold uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              No Photo Available
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(13,18,38,0.93) 0%, rgba(13,18,38,0.38) 55%, transparent 100%)' }}
        />

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            {property.type && (
              <span
                className="inline-block mb-2 px-2.5 py-0.5 rounded-[var(--radius-pill)] text-[9px] font-bold uppercase tracking-wider"
                style={{ background: 'rgba(240,165,0,0.92)', color: '#131b2e' }}
              >
                {property.type}
              </span>
            )}
            <h1
              className="font-serif text-[26px] md:text-[34px] font-semibold text-white leading-tight"
              >
              {property.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <MapPin size={12} style={{ color: 'rgba(255,255,255,0.45)' }} />
              <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.60)' }}>
                {property.encryptedAddress}
              </span>
            </div>
          </div>
          <span
            className="px-3 py-1.5 rounded-[var(--radius-pill)] text-[10px] font-bold uppercase tracking-wider shrink-0"
            style={{
              background: isActive ? 'rgba(16,185,129,0.92)' : 'rgba(100,116,139,0.85)',
              color: '#fff',
              backdropFilter: 'blur(8px)',
            }}
          >
            {property.status}
          </span>
        </div>
      </div>

      {/* ── Stats bento ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Home,     label: 'Units',      value: unitCount,                        iconClass: 'text-primary' },
          { icon: Wrench,   label: 'Quotes',     value: property._count?.quotes ?? 0,     iconClass: 'text-info' },
          { icon: Activity, label: 'Agreements', value: property._count?.agreements ?? 0, iconClass: 'text-success' },
          { icon: Tag,      label: 'Zone',       value: property.zone,                    iconClass: 'text-gold' },
        ].map(({ icon: Icon, label, value, iconClass }) => (
          <div
            key={label}
            className="flex flex-col gap-2 p-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)]"
          >
            <div className="flex items-center gap-1.5">
              <Icon size={13} className={iconClass} />
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                {label}
              </span>
            </div>
            <span
              className="text-[22px] font-bold leading-none"
              style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Meta bar ────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-4 flex-wrap px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)]"
        style={{ background: 'var(--surface-overlay)' }}
      >
        <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
          <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
          <span>
            Added{' '}
            {new Date(property.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span style={{ color: 'var(--border-strong)' }}>·</span>
          <span>
            Updated{' '}
            {new Date(property.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {isOwner && isActive && (
          <form
            action={async () => {
              'use server';
              await updatePropertyStatus(property.id, 'INACTIVE');
            }}
          >
            <Button type="submit" variant="outline" size="sm">Deactivate Property</Button>
          </form>
        )}
        {isOwner && !isActive && (
          <form
            action={async () => {
              'use server';
              await updatePropertyStatus(property.id, 'ACTIVE');
            }}
          >
            <Button type="submit" variant="primary" size="sm">Activate Property</Button>
          </form>
        )}
      </div>

      {/* ── Units ───────────────────────────────────────────────── */}
      {unitCount > 0 && (
        <div>
          {/* Section divider */}
          <div className="flex items-center gap-3 mb-4">
            <span className="font-serif text-[16px] font-semibold text-text-primary">
              Units{' '}
              <span className="font-sans text-caption font-normal text-text-muted">({unitCount})</span>
            </span>
            <hr className="flex-1 border-border-subtle" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {property.units.map((unit) => (
              <div
                key={unit.id}
                className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-accent transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
                  style={{ background: 'var(--surface-overlay)' }}
                >
                  <Home size={15} className="text-primary" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {unit.unitName}
                  </p>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {unit.unitType}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
