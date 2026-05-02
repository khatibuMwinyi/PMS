import Link from 'next/link';
import { Wrench, Tag, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface ServiceCardProps {
  service: {
    id:          string;
    name:        string;
    description: string;
    basePrice:   number;
    priceUnit:   string;
    category:    string;
    isActive:    boolean;
    _count?: {
      quotes?: number;
    };
  };
  href?: string; // Optional link for navigation
}

export function ServiceCard({ service, href }: ServiceCardProps) {
  const CardWrapper = href ? Link : 'div';
  const wrapperProps = href ? { href } : {};

  return (
    <Card
      {...wrapperProps}
      className="overflow-hidden border rounded-[var(--radius-lg)] transition-all duration-200 hover:border-[var(--on-surface)] hover:shadow-[var(--shadow-modal)] flex flex-col"
    >
      <CardContent className="flex flex-col gap-3 p-4 flex-1">
        {/* Header: Service name (font-h2, 14px, font-bold) + Status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[14px] font-bold leading-snug line-clamp-1" style={{ fontFamily: 'var(--font-h2)' }}>
            {service.name}
          </h3>
          <StatusBadge
            status={service.isActive ? 'ACTIVE' : 'INACTIVE'}
            className="shrink-0 mt-0.5"
          />
        </div>

        {/* Type badge (10px, bg-slate-100, uppercase) */}
        <div className="flex items-center gap-1.5">
          <Tag size={11} style={{ color: 'var(--brand-primary)' }} />
          <span
            className="px-2 py-0.5 rounded-[var(--radius-pill)] text-[10px] font-medium uppercase tracking-wider"
            style={{ background: '#f1f5f9', color: 'var(--text-secondary)' }}
          >
            {service.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-[var(--text-13px)] line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          {service.description}
        </p>

        {/* Stats row: Base price (font-data-tabular, text-right, font-semibold) */}
        <div
          className="flex items-center justify-between py-2 px-3 rounded-[var(--radius-md)] text-[var(--text-13px)] mt-auto"
          style={{ background: 'var(--surface-overlay)' }}
        >
          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <DollarSign size={13} style={{ color: 'var(--text-muted)' }} />
            <span>Base Price</span>
          </div>
          <span className="text-[var(--font-data-tabular)] font-semibold text-right">
            ${service.basePrice.toFixed(2)}
          </span>
        </div>

        {/* Optional: Unit count or location factor display */}
        {service._count && (
          <div className="flex items-center gap-1.5 text-[var(--text-xs)]" style={{ color: 'var(--text-muted)' }}>
            <Wrench size={11} />
            <span>{service._count.quotes || 0} quote{(service._count.quotes || 0) !== 1 ? 's' : ''}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
