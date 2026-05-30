// src/features/dashboard/components/owner/OwnerActivePropertiesPanel.tsx
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Home } from 'lucide-react';
import { getOwnerActiveProperties } from '@/features/dashboard/queries/owner';
import type { OwnerPropertyCard } from '@/features/dashboard/schemas/owner-dashboard.schema';

interface Props {
  ownerUserId: string;
  limit?: number;
}

function PropertyTile({ p, isLcp }: { p: OwnerPropertyCard; isLcp: boolean }) {
  return (
    <Link
      href={p.hrefDetail}
      className="group block rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-bold)] hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {p.imageUrl ? (
          <Image
            src={p.imageUrl}
            alt={p.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading={isLcp ? 'eager' : 'lazy'}
            priority={isLcp}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(145deg, var(--brand-primary) 0%, #1e3a5f 100%)' }}
          >
            <Home size={28} strokeWidth={1} style={{ color: 'rgba(255,255,255,0.18)' }} />
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(13,18,38,0.75) 0%, transparent 60%)' }}
        />

        {/* Active badge */}
        {p.isActive && (
          <span
            className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-[var(--radius-pill)] text-[9px] font-bold uppercase tracking-wider"
            style={{ background: 'rgba(16,185,129,0.92)', color: '#fff', backdropFilter: 'blur(8px)' }}
          >
            Active
          </span>
        )}

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-3.5 pb-3">
          <h4
            className="text-body-sm font-semibold text-white leading-snug line-clamp-1"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {p.name}
          </h4>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span className="text-caption line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
            {p.addressLine}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <div className="text-right">
            <span className="text-caption font-bold block" style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {p.occupancyPct}%
            </span>
            <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Occup.</span>
          </div>
          <div className="w-px h-5" style={{ background: 'var(--border-subtle)' }} />
          <div className="text-right">
            <span className="text-caption font-bold block" style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {p.unitCount}
            </span>
            <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Units</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ActivePropertiesEmptyState() {
  return (
    <div
      className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border-default)] p-10 text-center"
      style={{ background: 'var(--surface-overlay)' }}
    >
      <p className="text-body-sm mb-3" style={{ color: 'var(--text-muted)' }}>No active properties yet.</p>
      <a
        href="/owner/properties/new"
        className="inline-block rounded-[var(--radius-md)] px-4 py-2 text-body-sm font-semibold transition-opacity hover:opacity-90"
        style={{ background: 'var(--brand-gold)', color: 'var(--brand-primary)' }}
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
        <h3
          className="text-h3 font-semibold"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
        >
          Active Properties
        </h3>
        <Link
          href="/owner/properties"
          className="text-caption font-bold uppercase tracking-wider transition-colors hover:text-[var(--brand-gold-dark)]"
          style={{ color: 'var(--brand-gold)' }}
        >
          View All →
        </Link>
      </div>

      {properties.length === 0 ? (
        <ActivePropertiesEmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {properties.map((p, index) => (
            <PropertyTile key={p.id} p={p} isLcp={index === 0} />
          ))}
        </div>
      )}
    </section>
  );
}
