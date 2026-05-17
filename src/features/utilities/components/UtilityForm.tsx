'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { createUtilityBill } from '../actions';

interface PropertyOption {
  id: string;
  name: string;
}

const UTILITY_TYPES = [
  { value: 'WATER', label: 'Water' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'GAS', label: 'Gas' },
  { value: 'WASTE', label: 'Waste' },
];

const ALLOCATION_METHODS = [
  { value: 'PER_UNIT', label: 'Per unit (equal split)' },
  { value: 'PER_PERSON', label: 'Per person (by occupants)' },
  { value: 'PER_SQM', label: 'Per square metre' },
];

export function UtilityForm({ properties }: { properties: PropertyOption[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? '');
  const [type, setType] = useState<'WATER' | 'ELECTRICITY' | 'GAS' | 'WASTE'>('WATER');
  const [amount, setAmount] = useState('');
  const [billingPeriod, setBillingPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [allocationMethod, setAllocationMethod] = useState<'PER_UNIT' | 'PER_PERSON' | 'PER_SQM'>('PER_UNIT');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amt = Number(amount);
    if (!propertyId) {
      setError('Pick a property.');
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setError('Enter a positive amount.');
      return;
    }
    start(async () => {
      try {
        await createUtilityBill({
          propertyId,
          type,
          amount: amt,
          billingPeriod,
          allocationMethod,
        });
        setAmount('');
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save utility bill');
      }
    });
  };

  if (properties.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-outline-variant bg-[var(--surface-container-lowest)] p-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">Add a property before recording utility bills.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="bg-[var(--surface-container-lowest)] border border-outline-variant rounded-md p-5 space-y-3"
    >
      <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">Record a utility bill</h2>

      <Field label="Property">
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          className="w-full px-3 py-2 border border-outline-variant rounded-md text-sm bg-[var(--surface-container-lowest)]"
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Utility">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="w-full px-3 py-2 border border-outline-variant rounded-md text-sm bg-[var(--surface-container-lowest)]"
          >
            {UTILITY_TYPES.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Billing period">
          <input
            type="month"
            value={billingPeriod}
            onChange={(e) => setBillingPeriod(e.target.value)}
            className="w-full px-3 py-2 border border-outline-variant rounded-md text-sm bg-[var(--surface-container-lowest)]"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount (TZS)">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={0}
            step={100}
            placeholder="0"
            className="w-full px-3 py-2 border border-outline-variant rounded-md text-sm bg-[var(--surface-container-lowest)] tabular-nums"
          />
        </Field>

        <Field label="Allocation">
          <select
            value={allocationMethod}
            onChange={(e) => setAllocationMethod(e.target.value as typeof allocationMethod)}
            className="w-full px-3 py-2 border border-outline-variant rounded-md text-sm bg-[var(--surface-container-lowest)]"
          >
            {ALLOCATION_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {error && (
        <p className="text-sm text-[var(--state-error)] bg-[var(--state-error-bg)] rounded p-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full px-4 py-2.5 bg-[var(--brand-gold)] text-[var(--brand-primary)] rounded-md text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-1.5"
      >
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Saving…
          </>
        ) : (
          <>
            <Plus size={16} /> Record bill
          </>
        )}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
