import React from 'react';

/** Simple card displaying a service type */
export default function ServiceCard({ service }: { service: { id: string; name: string; description?: string; price?: number } }) {
  return (
    <div className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)] shadow-sm">
      <h3 className="font-medium text-[var(--text-primary)]">{service.name}</h3>
      {service.description && <p className="text-sm text-[var(--text-muted)] mt-1">{service.description}</p>}
      {service.price !== undefined && (
        <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--brand-primary)' }}>${service.price.toFixed(2)}</p>
      )}
    </div>
  );
}
