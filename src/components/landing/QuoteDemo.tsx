'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SERVICE_CATEGORIES } from '@/lib/landingContent';
import { calculateDemoQuote, formatTZS, type Frequency, type Region } from '@/lib/pricingRules.demo';
import { cn } from '@/lib/cn';

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'weekly',   label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly',  label: 'Monthly' },
];

const REGIONS: { value: Region; label: string }[] = [
  { value: 'dar',      label: 'Dar es Salaam' },
  { value: 'arusha',   label: 'Arusha' },
  { value: 'mwanza',   label: 'Mwanza' },
  { value: 'zanzibar', label: 'Zanzibar' },
  { value: 'other',    label: 'Other region' },
];

export function QuoteDemo() {
  const [service,   setService]   = useState('');
  const [units,     setUnits]     = useState(1);
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [region,    setRegion]    = useState<Region>('dar');

  const quote = calculateDemoQuote({ service, units, frequency, region });

  const labelCls = 'block text-caption text-text-muted uppercase tracking-wide mb-1.5';
  const selectCls = cn(
    'w-full h-10 px-3 rounded-md border border-border-default bg-surface-card text-text-primary text-body',
    'focus:outline-none focus:shadow-focus transition-all duration-base',
  );

  return (
    <section id="quote" className="bg-primary py-20 md:py-28">
      <div className="mx-auto max-w-editorial px-6">
        <div className="text-center mb-12">
          <p className="text-caption uppercase text-accent tracking-widest mb-3">Instant pricing</p>
          <h2 className="font-serif text-h1 text-text-on-dark">Get an instant quote.</h2>
          <p className="text-body-lg text-text-secondary-on-dark mt-3 max-w-lg mx-auto">
            Prices are locked for 24 hours. No card required to estimate.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-surface-card rounded-xl p-8 shadow-bold">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Service */}
            <div>
              <label htmlFor="qs-service" className={labelCls}>Service</label>
              <select
                id="qs-service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className={selectCls}
                aria-label="Service"
              >
                <option value="">Select a service…</option>
                {SERVICE_CATEGORIES.map((s) => (
                  <option key={s.key} value={s.key}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Units */}
            <div>
              <label htmlFor="qs-units" className={labelCls}>Units / properties</label>
              <input
                id="qs-units"
                type="number"
                min={1}
                max={99}
                value={units}
                onChange={(e) => setUnits(Math.max(1, Number(e.target.value)))}
                className={selectCls}
                aria-label="Units"
              />
            </div>

            {/* Frequency */}
            <div>
              <label htmlFor="qs-frequency" className={labelCls}>Frequency</label>
              <select
                id="qs-frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Frequency)}
                className={selectCls}
                aria-label="Frequency"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div>
              <label htmlFor="qs-region" className={labelCls}>Region</label>
              <select
                id="qs-region"
                value={region}
                onChange={(e) => setRegion(e.target.value as Region)}
                className={selectCls}
                aria-label="Region"
              >
                {REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Result */}
          <div className="mt-8 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              {quote ? (
                <>
                  <p className="text-caption text-text-muted uppercase tracking-wide">Estimated monthly total</p>
                  <p className="font-serif text-h1 text-text-primary tabular-nums">
                    TZS {formatTZS(quote.amount)}
                  </p>
                  <p className="text-body-sm text-text-muted mt-1">Price locked for 24 hours after quote</p>
                </>
              ) : (
                <p className="text-body text-text-muted">Select a service to see pricing.</p>
              )}
            </div>
            <Button
              as="a"
              href={`/register?intent=quote${service ? `&service=${service}` : ''}`}
              variant="gold"
              size="lg"
              disabled={!quote}
            >
              Request this quote
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
