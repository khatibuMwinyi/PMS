'use client';

import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { ProviderRegisterSchema } from '@/features/users/types';
import { registerProvider } from '@/features/users/actions';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/shared/LoadingButton';
import { PasswordStrengthMeter } from '@/components/shared/PasswordStrengthMeter';
import { TagInput } from '@/components/shared/TagInput';

const Schema = ProviderRegisterSchema.extend({
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path:    ['confirmPassword'],
});

const defaultFormValues: FormData = {
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  businessName: '',
  serviceCategories: [] as string[],
  operationalZones: [] as string[],
};

type FormData = z.infer<typeof Schema>;

const SERVICE_CATEGORIES = [
  { value: 'CLEANING',     label: 'Cleaning',     emoji: '🧹' },
  { value: 'MAINTENANCE',  label: 'Maintenance',  emoji: '🔧' },
  { value: 'LANDSCAPING',  label: 'Landscaping',  emoji: '🌿' },
  { value: 'SECURITY',     label: 'Security',     emoji: '🔒' },
  { value: 'PLUMBING',     label: 'Plumbing',     emoji: '🚿' },
  { value: 'ELECTRICAL',   label: 'Electrical',   emoji: '⚡' },
];

interface ProviderRegisterFormProps {
  onSuccess: () => void;
}

export function ProviderRegisterForm({ onSuccess }: ProviderRegisterFormProps) {
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: {
      serviceCategories: [],
      operationalZones:  [],
    },
  });

  const passwordValue = watch('password') ?? '';

  const toggleCategory = useCallback(
    (cat: string) => {
      const current = getValues('serviceCategories') ?? [];
      setValue(
        'serviceCategories',
        current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat],
        { shouldValidate: true }
      );
    },
    [getValues, setValue]
  );

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await registerProvider({
        email:             data.email,
        phone:             data.phone,
        password:          data.password,
        businessName:      data.businessName,
        serviceCategories: data.serviceCategories,
        operationalZones:  data.operationalZones,
      });
      onSuccess();
    } catch (err: any) {
      setServerError(err?.message ?? 'Registration failed. Please try again.');
    }
  };

  const selectedCategories = watch('serviceCategories') ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <fieldset disabled={isSubmitting} className="border-none p-0 m-0 min-w-0 flex flex-col gap-4">

        {serverError && (
          <div className="px-4 py-3 rounded-[var(--radius-md)] bg-[var(--state-error-bg)]">
            <p className="text-[13px] text-[var(--state-error)]">{serverError}</p>
          </div>
        )}

        <Input
          label="Business / Trading Name"
          type="text"
          placeholder="e.g. CleanCo Services"
          error={errors.businessName?.message}
          {...register('businessName')}
        />

        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Phone Number"
          type="tel"
          autoComplete="tel"
          placeholder="+255 71x xxx xxxx"
          helper="+255 71x or +255 68x format"
          error={errors.phone?.message}
          {...register('phone')}
        />

        {/* Password */}
        <div>
          <Input
            label="Password"
            type={showPass ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.password?.message}
            rightElement={
              <button type="button" tabIndex={-1} onClick={() => setShowPass((v) => !v)} aria-label="Toggle password">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            {...register('password')}
          />
          <PasswordStrengthMeter password={passwordValue} />
        </div>

        <Input
          label="Confirm Password"
          type={showConfirm ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          rightElement={
            <button type="button" tabIndex={-1} onClick={() => setShowConfirm((v) => !v)} aria-label="Toggle confirm">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          {...register('confirmPassword')}
        />

        {/* Service categories */}
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-medium text-[var(--text-secondary)]">
            What services do you offer?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SERVICE_CATEGORIES.map(({ value, label, emoji }) => {
              const selected = selectedCategories.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleCategory(value)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-md)] border text-[13px] font-medium transition-all duration-120 text-left"
                  style={
                    selected
                      ? {
                          background:    '#e8f7f2',
                          borderColor:   'var(--brand-primary)',
                          color:         'var(--brand-primary-dim)',
                        }
                      : {
                          background:  'var(--surface-card)',
                          borderColor: 'var(--border-default)',
                          color:       'var(--text-secondary)',
                        }
                  }
                  aria-pressed={selected}
                >
                  <span>{emoji}</span>
                  {label}
                  {selected && (
                    <span className="ml-auto text-[var(--brand-primary)]">✓</span>
                  )}
                </button>
              );
            })}
          </div>
          {errors.serviceCategories && (
            <p className="text-[13px] text-[var(--state-error)]">
              {errors.serviceCategories.message as string}
            </p>
          )}
        </div>

        {/* Operational zones */}
        <Controller
          name="operationalZones"
          control={control}
          render={({ field }) => (
            <TagInput
              label="Which areas do you cover?"
              placeholder="e.g. Kinondoni, Msasani, Masaki — press Enter"
              helper="Type an area name and press Enter or comma to add"
              value={field.value}
              onChange={field.onChange}
              error={errors.operationalZones?.message as string | undefined}
            />
          )}
        />

        <LoadingButton
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          loadingText="Submitting application…"
          className="mt-1"
        >
          Apply as Provider
        </LoadingButton>

      </fieldset>
    </form>
  );
}