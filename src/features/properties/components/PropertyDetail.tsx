import { MapPin, Home, Wrench, Tag, Calendar, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
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
      quotes:   number;
      agreements: number;
    };
  };
  isOwner: boolean;
}

export function PropertyDetail({ property, isOwner }: PropertyDetailProps) {
  const firstImage = property.imageUrls?.[0];
  const unitCount  = property.units?.length ?? 0;

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* ── Header Section ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Property Image */}
        <div className="md:w-2/5 rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border-default)]">
          {firstImage ? (
            <img
              src={firstImage}
              alt={property.name}
              className="w-full h-48 md:h-64 object-cover"
            />
          ) : (
            <div
              className="w-full h-48 md:h-64 flex items-center justify-center"
              style={{ background: 'var(--surface-overlay)' }}
            >
              <div className="flex flex-col items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Home size={48} strokeWidth={1.5} />
                <span className="text-[var(--text-sm)]">No image available</span>
              </div>
            </div>
          )}
        </div>

        {/* Property Info */}
        <div className="md:w-3/5 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[var(--font-h1)] font-bold text-[var(--text-primary)]">
                {property.name}
              </h1>
              <StatusBadge status={property.status} />
            </div>
            {property.type && (
              <span
                className="inline-block px-3 py-1 rounded-[var(--radius-pill)] text-[10px] font-medium uppercase tracking-wider mb-3"
                style={{ background: 'var(--surface-overlay)', color: 'var(--text-secondary)' }}
              >
                {property.type}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[var(--text-13px)]" style={{ color: 'var(--text-secondary)' }}>
            <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
            <span>{property.encryptedAddress}</span>
          </div>

          <div className="flex items-center gap-2 text-[var(--text-13px)]" style={{ color: 'var(--text-secondary)' }}>
            <Tag size={14} style={{ color: 'var(--text-muted)' }} />
            <span>Zone: {property.zone}</span>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Home size={20} className="mx-auto mb-2" style={{ color: 'var(--brand-primary)' }} />
                <p className="text-[var(--font-h2)] font-bold text-[var(--text-primary)]">{unitCount}</p>
                <p className="text-[var(--text-xs)]" style={{ color: 'var(--text-secondary)' }}>Units</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Wrench size={20} className="mx-auto mb-2" style={{ color: 'var(--color-success)' }} />
                <p className="text-[var(--font-h2)] font-bold text-[var(--text-primary)]">
                  {property._count?.quotes || 0}
                </p>
                <p className="text-[var(--text-xs)]" style={{ color: 'var(--text-secondary)' }}>Quotes</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Activity size={20} className="mx-auto mb-2" style={{ color: 'var(--color-info)' }} />
                <p className="text-[var(--font-h2)] font-bold text-[var(--text-primary)]">
                  {property._count?.agreements || 0}
                </p>
                <p className="text-[var(--text-xs)]" style={{ color: 'var(--text-secondary)' }}>Agreements</p>
              </CardContent>
            </Card>
          </div>

          {/* Status Actions (Owner only) */}
          {isOwner && property.status === 'ACTIVE' && (
            <form
              action={async () => {
                'use server';
                await updatePropertyStatus(property.id, 'INACTIVE');
              }}
            >
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Deactivate Property
              </Button>
            </form>
          )}

          {isOwner && property.status !== 'ACTIVE' && (
            <form
              action={async () => {
                'use server';
                await updatePropertyStatus(property.id, 'ACTIVE');
              }}
            >
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="mt-4"
              >
                Activate Property
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* ── Units Section ──────────────────────────────── */}
      {unitCount > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-[var(--font-h2)] font-semibold text-[var(--text-primary)]">
              Units ({unitCount})
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {property.units.map((unit) => (
                <div
                  key={unit.id}
                  className="p-4 rounded-[var(--radius-md)] border border-[var(--border-default)]"
                >
                  <p className="font-medium text-[var(--text-primary)]">{unit.unitName}</p>
                  <p className="text-[var(--text-xs)] mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {unit.unitType}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Timeline ───────────────────────────────────── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-[var(--text-13px)]" style={{ color: 'var(--text-secondary)' }}>
            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
            <span>Created: {new Date(property.createdAt).toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <span>Last updated: {new Date(property.updatedAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
