import { ServiceCard } from './ServiceCard';

type Service = Parameters<typeof ServiceCard>[0]['service'];

interface ServiceListProps {
  services: Service[];
  isAdmin?: boolean;
}

export function ServiceList({ services, isAdmin = false }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[320px] rounded-[var(--radius-xl)] border border-dashed p-8"
        style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
      >
        <p className="text-[var(--text-lg)] font-medium mb-2">No services found</p>
        <p className="text-[var(--text-sm)]">
          {isAdmin
            ? 'Click "Add Service" to create your first service type.'
            : 'No active services available at the moment.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          href={isAdmin ? `/admin/services/${service.id}` : undefined}
        />
      ))}
    </div>
  );
}
