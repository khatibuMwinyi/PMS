import { Suspense } from 'react';
import { auth } from '@/core/auth';
import { redirect } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import { ServiceList } from '@/features/services/components/ServiceList';
import { getServiceTypes } from '@/features/services/actions';
import { AddServiceButton } from '@/features/services/components/AddServiceButton';
import type { ServiceCardProps } from '@/features/services/components/ServiceCard';

export const metadata = {
  title: 'Service Catalog — Oweru',
};

interface ServiceWithCounts {
  id:          string;
  name:        string;
  description: string;
  basePrice:   number;
  priceUnit:   string;
  category:    string;
  isActive:    boolean;
  _count?: {
    quotes: number;
  };
}

export default function AdminServicesPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <Suspense fallback={<div>Loading services...</div>}>
        <AdminServicesContent />
      </Suspense>
    </RoleGuard>
  );
}

async function AdminServicesContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/login');

  const services = await getServiceTypes(true); // include inactive

  const serviceCards: ServiceWithCounts[] = services.map((s: any) => ({
    id:          s.id,
    name:        s.name,
    description: s.description || '',
    basePrice:   Number(s.basePrice),
    priceUnit:   'PER_UNIT' as const,
    category:    'general',
    isActive:    s.isActive ?? true,
    _count:      s._count || { assignments: 0, quotes: 0 },
  }));

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-semibold text-[var(--text-primary)] leading-tight">
            Service Catalog
          </h1>
          <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Manage service types, pricing, and catalog settings
          </p>
        </div>
        <AddServiceButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-[var(--radius-lg)] border" style={{ background: 'var(--surface)', borderColor: 'var(--border-default)' }}>
          <p className="text-[var(--text-sm)]" style={{ color: 'var(--text-secondary)' }}>Total Services</p>
          <p className="text-h2 font-bold text-[var(--text-primary)]">{serviceCards.length}</p>
        </div>
        <div className="p-4 rounded-[var(--radius-lg)] border" style={{ background: 'var(--surface)', borderColor: 'var(--border-default)' }}>
          <p className="text-[var(--text-sm)]" style={{ color: 'var(--text-secondary)' }}>Active</p>
          <p className="text-h2 font-bold text-[var(--text-primary)]">
            {serviceCards.filter((s) => s.isActive).length}
          </p>
        </div>
        <div className="p-4 rounded-[var(--radius-lg)] border" style={{ background: 'var(--surface)', borderColor: 'var(--border-default)' }}>
          <p className="text-[var(--text-sm)]" style={{ color: 'var(--text-secondary)' }}>Inactive</p>
          <p className="text-h2 font-bold text-[var(--text-primary)]">
            {serviceCards.filter((s) => !s.isActive).length}
          </p>
        </div>
      </div>

      {/* Service Grid */}
      <ServiceList services={serviceCards} isAdmin={true} />
    </div>
  );
}