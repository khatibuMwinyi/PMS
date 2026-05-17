import Link from 'next/link';
import {
  Brush,
  Wrench,
  Zap,
  Shield,
  Trees,
  Hammer,
  Box,
  type LucideIcon,
} from 'lucide-react';
import { getActiveCatalog } from '../services';

function pickIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes('clean')) return Brush;
  if (n.includes('plumb')) return Wrench;
  if (n.includes('electric') || n.includes('hvac') || n.includes('air')) return Zap;
  if (n.includes('security') || n.includes('guard')) return Shield;
  if (n.includes('garden') || n.includes('landscap') || n.includes('lawn')) return Trees;
  if (n.includes('repair') || n.includes('maintenance')) return Hammer;
  return Box;
}

export async function ServiceCatalogGrid() {
  const catalog = await getActiveCatalog();

  if (catalog.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-outline-variant bg-[var(--surface-container-lowest)] p-12 text-center">
        <p className="text-sm text-[var(--text-muted)]">Catalog is empty. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {catalog.map((entry) => {
        const Icon = pickIcon(entry.name);
        return (
          <div
            key={entry.id}
            className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-5 flex flex-col gap-3 hover:border-[var(--brand-gold)] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="p-2 rounded bg-[var(--surface-container-low)] text-[var(--brand-primary)]">
                <Icon size={20} />
              </div>
              <span className="badge-status bg-[var(--state-success-bg)] text-[var(--state-success)]">
                Available
              </span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                {entry.name}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-snug">
                {entry.description}
              </p>
            </div>
            <div className="mt-auto pt-3 border-t border-outline-variant flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium">
                  From
                </p>
                <p className="text-base font-semibold tabular-nums text-[var(--text-primary)]">
                  {entry.basePriceFormatted}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">{entry.priceUnitLabel}</p>
              </div>
              <Link
                href={`/owner/services/new?serviceTypeId=${entry.id}`}
                className="px-3 py-1.5 bg-[var(--brand-primary)] text-[var(--text-on-brand)] rounded text-xs font-semibold hover:bg-[var(--brand-primary-light)] transition-colors"
              >
                Get Quote
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
