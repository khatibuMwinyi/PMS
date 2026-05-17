'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Clock, Loader2 } from 'lucide-react';
import { submitOwnerQuote } from '@/features/owner-services/quote-actions';

interface ServiceType {
  id: string;
  name: string;
  description: string;
  basePrice: unknown;
  pricingRules: unknown;
}

interface PropertyWithUnits {
  id: string;
  name: string;
  units: { id: string; unitName: string }[];
}

interface Quote {
  id: string;
  quotedPrice: number | string;
  priceLockedUntil: string | null;
}

interface Props {
  services: ServiceType[];
  properties: PropertyWithUnits[];
}

export function ServiceRequestForm({ services, properties }: Props) {
  const params = useSearchParams();
  const preselectService = params.get('serviceTypeId') ?? '';

  const [selectedService, setSelectedService] = useState(preselectService);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, startSubmit] = useTransition();

  const property = properties.find((p) => p.id === selectedProperty);
  const units = property?.units ?? [];

  const fetchQuote = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await fetch('/api/owner/pricelock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedProperty,
          serviceTypeId: selectedService,
          unitId: selectedUnit || undefined,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error ?? 'Failed to create quote');
      setQuote(data.quote);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create quote');
    } finally {
      setLoading(false);
    }
  };

  const submitQuote = () => {
    if (!quote) return;
    setError('');
    startSubmit(async () => {
      try {
        await submitOwnerQuote(quote.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Submission failed');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-5 space-y-4">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Service details</h2>

        <Field label="Service">
          <select
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              setQuote(null);
            }}
            className="w-full px-3 py-2 border border-outline-variant rounded-md text-sm bg-[var(--surface-container-lowest)]"
          >
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Property">
          <select
            value={selectedProperty}
            onChange={(e) => {
              setSelectedProperty(e.target.value);
              setSelectedUnit('');
              setQuote(null);
            }}
            className="w-full px-3 py-2 border border-outline-variant rounded-md text-sm bg-[var(--surface-container-lowest)]"
          >
            <option value="">Select a property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        {selectedProperty && units.length > 0 && (
          <Field label="Unit (optional)">
            <select
              value={selectedUnit}
              onChange={(e) => {
                setSelectedUnit(e.target.value);
                setQuote(null);
              }}
              className="w-full px-3 py-2 border border-outline-variant rounded-md text-sm bg-[var(--surface-container-lowest)]"
            >
              <option value="">Whole property</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.unitName}
                </option>
              ))}
            </select>
          </Field>
        )}

        <button
          onClick={fetchQuote}
          disabled={!selectedService || !selectedProperty || loading}
          className="w-full px-4 py-2.5 bg-[var(--brand-primary)] text-[var(--text-on-brand)] rounded-md text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Calculating…
            </>
          ) : (
            'Get Quote'
          )}
        </button>

        {error && (
          <p className="text-sm text-[var(--state-error)] bg-[var(--state-error-bg)] rounded p-2">
            {error}
          </p>
        )}
      </div>

      <aside className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-5 space-y-3">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Quote</h2>
        {!quote ? (
          <p className="text-sm text-[var(--text-muted)]">
            Pick a service and property, then get an instant quote. Pricing locks for 24 hours.
          </p>
        ) : (
          <QuoteSummary
            quote={quote}
            submitting={submitting}
            onSubmit={submitQuote}
          />
        )}
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function QuoteSummary({
  quote,
  submitting,
  onSubmit,
}: {
  quote: Quote;
  submitting: boolean;
  onSubmit: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const expiresAtMs = quote.priceLockedUntil ? new Date(quote.priceLockedUntil).getTime() : null;
  const remainingMs = expiresAtMs ? expiresAtMs - now : null;
  const expired = remainingMs !== null && remainingMs <= 0;

  const amountFormatted = `TZS ${Number(quote.quotedPrice).toLocaleString()}`;

  return (
    <div className="space-y-3">
      <div className="bg-[var(--surface-container-low)] rounded p-3">
        <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1">
          Total
        </p>
        <p className="text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
          {amountFormatted}
        </p>
      </div>

      {expiresAtMs !== null && (
        <div
          className={[
            'flex items-center gap-2 text-xs px-3 py-2 rounded tabular-nums',
            expired
              ? 'bg-[var(--state-error-bg)] text-[var(--state-error)]'
              : 'bg-[var(--state-info-bg)] text-[var(--state-info)]',
          ].join(' ')}
        >
          <Clock size={14} />
          {expired ? (
            'Quote expired — request a new quote.'
          ) : (
            <span>Locked for {formatRemaining(remainingMs ?? 0)}.</span>
          )}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={expired || submitting}
        className="w-full px-4 py-2.5 bg-[var(--brand-gold)] text-[var(--brand-primary)] rounded-md text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Submitting…
          </>
        ) : (
          'Submit Request'
        )}
      </button>

      <p className="text-[11px] text-[var(--text-muted)] leading-snug">
        Submitting locks this price and starts provider assignment. Cancellation is free until a
        provider accepts.
      </p>
    </div>
  );
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return '0s';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
