'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createServiceType, updateServiceType } from '@/features/services/actions';
import { PriceUnitSchema } from '@/features/services/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';

const FormSchema = z.object({
  name:        z.string().min(1, 'Service name is required'),
  description: z.string().min(1, 'Description is required'),
  basePrice:   z.coerce.number().positive('Base price must be positive'),
  priceUnit:   z.enum(['PER_SQM', 'PER_UNIT', 'FLAT', 'PER_BEDROOM']),
  category:    z.string().min(1, 'Category is required'),
  isActive:    z.boolean(),
});

type FormValues = z.infer<typeof FormSchema>;

interface ServiceFormProps {
  initialData?: {
    id:          string;
    name:        string;
    description: string;
    basePrice:   number;
    priceUnit:   string;
    category:    string;
    isActive:    boolean;
  };
  onSuccess?: () => void;
  isEditing?: boolean;
}

export function ServiceForm({ initialData, onSuccess, isEditing = false }: ServiceFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData
      ? {
          name:        initialData.name,
          description: initialData.description,
          basePrice:   initialData.basePrice,
          priceUnit:   initialData.priceUnit as any,
          category:    initialData.category,
          isActive:    initialData.isActive,
        }
      : { name: '', description: '', basePrice: 0, priceUnit: 'FLAT', category: '', isActive: true },
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);

    const formData = new FormData();
    formData.append('name',        data.name);
    formData.append('description', data.description);
    formData.append('basePrice',  String(data.basePrice));
    formData.append('priceUnit',  data.priceUnit);
    formData.append('category',   data.category);
    formData.append('isActive',   String(data.isActive));

    try {
      const result = isEditing && initialData
        ? await updateServiceType(initialData.id, formData)
        : await createServiceType(formData);

      if (!result.success) {
        setServerError('Failed to save service type. Please try again.');
        return;
      }

      reset();
      onSuccess?.();
    } catch (error: any) {
      setServerError(error.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <fieldset disabled={isSubmitting} className="border-none p-0 m-0 flex flex-col gap-5">

        {serverError && (
          <div
            className="px-4 py-3 rounded-[var(--radius-md)] text-body-sm"
            style={{ background: 'var(--state-error-bg)', color: 'var(--state-error)' }}
          >
            {serverError}
          </div>
        )}

        <Input
          label="Service Name"
          placeholder="e.g., Standard Cleaning"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-[var(--text-sm)] font-medium" style={{ color: 'var(--text-primary)' }}>
            Description
          </label>
          <TextArea
            placeholder="Brief description of the service..."
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Base Price ($)"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.basePrice?.message}
            {...register('basePrice')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-[var(--text-sm)] font-medium" style={{ color: 'var(--text-primary)' }}>
              Price Unit
            </label>
            <select
              {...register('priceUnit')}
              className="px-3 py-2 rounded-[var(--radius-md)] border text-[var(--text-sm)]"
              style={{
                borderColor: 'var(--border-default)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="PER_UNIT">Per Unit</option>
              <option value="PER_SQM">Per SqM</option>
              <option value="FLAT">Flat Rate</option>
              <option value="PER_BEDROOM">Per Bedroom</option>
            </select>
            {errors.priceUnit && (
              <p className="text-[var(--color-danger)] text-caption">{errors.priceUnit.message}</p>
            )}
          </div>
        </div>

        <Input
          label="Category"
          placeholder="e.g., Cleaning, Maintenance, Landscaping"
          error={errors.category?.message}
          {...register('category')}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            {...register('isActive')}
            className="rounded border-[var(--border-default)]"
          />
          <label htmlFor="isActive" className="text-[var(--text-sm)]" style={{ color: 'var(--text-secondary)' }}>
            Active (visible to property owners)
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
        >
          {isEditing ? 'Update Service' : 'Create Service'}
        </Button>
      </fieldset>
    </form>
  );
}
