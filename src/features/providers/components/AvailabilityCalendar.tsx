'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { addBlockedDate, removeBlockedDate } from '../actions';

interface BlockedDate {
  id: string;
  date: string;
}

interface Props {
  dates: BlockedDate[];
}

export function AvailabilityCalendar({ dates }: Props) {
  const router = useRouter();
  const [pickerValue, setPickerValue] = useState('');
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    if (!pickerValue) return;
    startTransition(async () => {
      try {
        await addBlockedDate({ date: pickerValue });
        toast.success('Date blocked');
        setPickerValue('');
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not block date';
        toast.error(message);
      }
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      try {
        await removeBlockedDate({ id });
        toast.success('Date unblocked');
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not remove date';
        toast.error(message);
      }
    });
  }

  return (
    <Card padding="comfortable">
      <h2 className="text-h3 text-text-primary mb-4">Availability</h2>
      <div className="flex flex-col gap-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              label="Date to block"
              type="date"
              value={pickerValue}
              onChange={(e) => setPickerValue(e.target.value)}
            />
          </div>
          <Button onClick={handleAdd} loading={pending} disabled={!pickerValue}>
            Add
          </Button>
        </div>
        {dates.length === 0 ? (
          <p className="text-body-sm text-text-muted">
            No dates blocked. Add a date above to make yourself unavailable.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {dates.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-md border border-border-default px-3 h-10 bg-surface-card"
              >
                <span className="text-body text-text-primary">{d.date}</span>
                <button
                  type="button"
                  aria-label={`Remove ${d.date}`}
                  onClick={() => handleRemove(d.id)}
                  disabled={pending}
                  className="text-text-muted hover:text-state-error disabled:opacity-50"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
