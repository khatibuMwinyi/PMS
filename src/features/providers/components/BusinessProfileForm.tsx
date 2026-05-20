'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateProviderProfile } from '../actions';

interface Props {
  initial: {
    businessName: string;
    mobileMoneyNumber: string | null;
  };
}

export function BusinessProfileForm({ initial }: Props) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(initial.businessName);
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState(
    initial.mobileMoneyNumber ?? '',
  );
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      try {
        const trimmedName = businessName.trim();
        const trimmedPhone = mobileMoneyNumber.trim();
        await updateProviderProfile({
          businessName: trimmedName,
          mobileMoneyNumber: trimmedPhone === '' ? null : trimmedPhone,
        });
        toast.success('Business profile updated');
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Update failed';
        toast.error(message);
      }
    });
  }

  return (
    <Card padding="comfortable">
      <h2 className="text-h3 text-text-primary mb-4">Business profile</h2>
      <div className="flex flex-col gap-4">
        <Input
          label="Business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Acme Services"
        />
        <Input
          label="Mobile money number"
          type="tel"
          value={mobileMoneyNumber}
          onChange={(e) => setMobileMoneyNumber(e.target.value)}
          placeholder="+255712345678"
          helper="Tanzania format, leave blank to remove"
        />
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={pending}>
            Save profile
          </Button>
        </div>
      </div>
    </Card>
  );
}
