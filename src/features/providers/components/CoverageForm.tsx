'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { updateProviderCoverage } from '../actions';

interface Props {
  initial: {
    serviceCategories: string[];
    serviceRadiusKm: number;
  };
  catalog: Array<{ id: string; name: string }>;
}

export function CoverageForm({ initial, catalog }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(initial.serviceCategories);
  const [radius, setRadius] = useState<string>(String(initial.serviceRadiusKm));
  const [pending, startTransition] = useTransition();

  const hasNone = selected.length === 0;

  function toggleCategory(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }

  function handleSave() {
    const radiusInt = Number.parseInt(radius, 10);
    startTransition(async () => {
      try {
        await updateProviderCoverage({
          serviceCategories: selected,
          serviceRadiusKm: radiusInt,
        });
        toast.success('Coverage updated');
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Update failed';
        toast.error(message);
      }
    });
  }

  return (
    <Card padding="comfortable">
      <h2 className="text-h3 text-text-primary mb-4">Coverage</h2>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-caption mb-1.5 text-text-primary font-medium">
            Service categories
          </label>
          <div className="flex flex-wrap gap-2">
            {catalog.map((c) => {
              const isOn = selected.includes(c.name);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c.name)}
                  aria-pressed={isOn}
                  className={cn(
                    'rounded-md px-3 h-8 text-body-sm border transition-all duration-base',
                    isOn
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface-card text-text-primary border-border-default hover:bg-surface-overlay',
                  )}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
          {hasNone && (
            <p className="mt-1.5 text-body-sm text-state-error">
              Pick at least one service category.
            </p>
          )}
        </div>
        <Input
          label="Service radius (km)"
          type="number"
          min={5}
          max={30}
          step={1}
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          helper="Between 5 and 30 km"
        />
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={pending} disabled={hasNone}>
            Save coverage
          </Button>
        </div>
      </div>
    </Card>
  );
}
