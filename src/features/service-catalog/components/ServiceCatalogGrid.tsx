import Link from 'next/link';
import {
  Brush, Wrench, Zap, Shield, Trees, Hammer, Box,
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
      <div className="rounded-lg border border-dashed border-border-subtle bg-surface-card p-12 text-center">
        <p className="text-body-sm text-text-muted">Catalog is empty. Check back soon.</p>
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
            className="bg-surface-card border border-border-subtle rounded-lg p-5 flex flex-col gap-3 hover:border-accent transition-colors shadow-card"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center">
                <Icon size={20} className="text-text-primary" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-semibold bg-state-success-bg text-state-success">
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                Available
              </span>
            </div>

            <div>
              <h3 className="text-h4 font-semibold text-text-primary mb-1">{entry.name}</h3>
              <p className="text-body-sm text-text-secondary line-clamp-2 leading-snug">
                {entry.description}
              </p>
            </div>

            <div className="mt-auto pt-3 border-t border-border-subtle flex items-end justify-between">
              <div>
                <p className="text-caption font-semibold uppercase tracking-widest text-text-muted">
                  From
                </p>
                <p className="text-body font-semibold tabular-nums text-text-primary">
                  {entry.basePriceFormatted}
                </p>
                <p className="text-caption text-text-muted">{entry.priceUnitLabel}</p>
              </div>
              <Link
                href={`/owner/services/new?serviceTypeId=${entry.id}`}
                className="px-3 py-1.5 bg-primary text-white rounded text-caption font-semibold hover:bg-primary-light transition-colors"
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
