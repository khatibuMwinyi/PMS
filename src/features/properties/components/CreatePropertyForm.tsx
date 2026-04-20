'use client';

import { useState } from 'react';
import { useForm }  from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createProperty } from '@/features/properties/actions';
import { DAR_ES_SALAAM_LAT, DAR_ES_SALAAM_LNG } from '@/features/properties/types';
import { Input }          from '@/components/ui/input';
import { LoadingButton }  from '@/components/shared/LoadingButton';
import { ImageUploadField } from './ImageUploadField';

// ─── Client-side Zod schema (mirrors server schema) ─────────────────
const Schema = z.object({
  name:    z.string().min(1, 'Property name is required'),
  address: z.string().min(5, 'Full address is required'),
  zone:    z.string().min(2, 'Neighbourhood is required — this is what providers will see'),
});
type FormValues = z.infer<typeof Schema>;

interface CreatePropertyFormProps {
  onSuccess: () => void;
}

export function CreatePropertyForm({ onSuccess }: CreatePropertyFormProps) {
  const [files, setFiles]           = useState<File[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(Schema) });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);

    const formData = new FormData();
    formData.append('name',      data.name);
    formData.append('address',   data.address);
    formData.append('zone',      data.zone);
    // Default Dar es Salaam coordinates for MVP — map picker in Phase 2
    formData.append('latitude',  String(DAR_ES_SALAAM_LAT));
    formData.append('longitude', String(DAR_ES_SALAAM_LNG));
    files.forEach((f) => formData.append('images', f));

    const result = await createProperty(formData);

    if (!result.success) {
      setServerError(result.error ?? 'Failed to create property. Please try again.');
      return;
    }

    reset();
    setFiles([]);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <fieldset disabled={isSubmitting} className="border-none p-0 m-0 min-w-0 flex flex-col gap-5">

        {/* Server error */}
        {serverError && (
          <div
            className="px-4 py-3 rounded-[var(--radius-md)] text-[13px]"
            style={{ background: 'var(--state-error-bg)', color: 'var(--state-error)' }}
          >
            {serverError}
          </div>
        )}

        {/* Property name */}
        <Input
          label="Property Name"
          placeholder="e.g. Msasani Apartments Block A"
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Full address — encrypted, never shown to providers */}
        <Input
          label="Full Address"
          placeholder="e.g. 12 Haile Selassie Road, Msasani, Dar es Salaam"
          helper="Encrypted and stored securely — never shared with service providers"
          error={errors.address?.message}
          {...register('address')}
        />

        {/* Zone — shown to providers instead of exact address */}
        <Input
          label="Neighbourhood / Zone"
          placeholder="e.g. Msasani Area, Kinondoni, Masaki"
          helper="This is what providers will see — keep it to the neighbourhood level"
          error={errors.zone?.message}
          {...register('zone')}
        />

        {/* Location note */}
        <div
          className="px-4 py-3 rounded-[var(--radius-md)] text-[13px] leading-relaxed"
          style={{ background: 'var(--surface-overlay)', color: 'var(--text-secondary)' }}
        >
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>📍 Location — </span>
          Using default Dar es Salaam coordinates for the MVP.
          A map picker will be available in Phase 2 for precise positioning.
        </div>

        {/* Images */}
        <ImageUploadField
          label="Property Photos (optional)"
          onChange={setFiles}
          maxFiles={5}
        />

        {/* Submit */}
        <LoadingButton
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          loadingText="Creating property…"
        >
          Create Property
        </LoadingButton>

      </fieldset>
    </form>
  );
}