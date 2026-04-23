'use client';

import { useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface ServiceType {
  id: string;
  name: string;
  description: string;
  basePrice: any;
  pricingRules: any;
}

interface PropertyWithUnits {
  id: string;
  name: string;
  units: { id: string; unitName: string }[];
}

export function ServiceRequestForm({ services, properties }: { services: ServiceType[]; properties: PropertyWithUnits[] }) {
  const [selectedService, setSelectedService] = useState('')
  const [selectedProperty, setSelectedProperty] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')
  const [quote, setQuote] = useState<{amount: string; currency: string; expiresAt: string} | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const property = properties.find((p) => p.id === selectedProperty)
  const units = property?.units || []

  const fetchQuote = async () => {
    setLoading(true)
    setError('')
    try {
      const resp = await fetch('/api/owner/pricelock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedProperty,
          serviceTypeId: selectedService,
          unitId: selectedUnit,
        }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Failed to create lock')
      setQuote(data.quote)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <select
        value={selectedService}
        onChange={(e) => { setSelectedService(e.target.value); setQuote(null); }}
        className="p-2 border rounded"
      >
        <option value="">Select a service</option>
        {services.map((s: any) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <select
        value={selectedProperty}
        onChange={(e) => { setSelectedProperty(e.target.value); setSelectedUnit(''); setQuote(null); }}
        className="p-2 border rounded"
      >
        <option value="">Select a property</option>
        {properties.map((p: any) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {selectedProperty && (
        <select
          value={selectedUnit}
          onChange={(e) => { setSelectedUnit(e.target.value); setQuote(null); }}
          className="p-2 border rounded"
        >
          <option value="">Select a unit (optional)</option>
          {units.map((u: any) => (
            <option key={u.id} value={u.id}>{u.unitName}</option>
          ))}
        </select>
      )}

      <button
        onClick={fetchQuote}
        disabled={!selectedService || !selectedProperty || loading}
        className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded disabled:opacity-50"
      >
        {loading ? 'Getting quote...' : 'Get Quote'}
      </button>

      <div className="p-4 bg-[var(--surface-card)] rounded-[var(--radius-md)]">
        {error && <p className="text-red-600">{error}</p>}
        {quote ? (
          <p>Quote: {quote.amount} {quote.currency} (expires {new Date(quote.expiresAt).toLocaleString()})</p>
        ) : (
          <p>Please select a service, property, and unit.</p>
        )}
      </div>
    </div>
  );
}