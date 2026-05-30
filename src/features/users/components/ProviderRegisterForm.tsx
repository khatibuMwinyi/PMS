'use client';

import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeOff } from 'lucide-react';
import { ProviderRegisterSchema } from '@/features/users/types';
import { registerProvider } from '@/features/users/actions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PasswordStrengthMeter } from '@/components/shared/PasswordStrengthMeter';
import { TagInput } from '@/components/shared/TagInput';

const Schema = ProviderRegisterSchema.extend({
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path:    ['confirmPassword'],
});

type FormData = z.infer<typeof Schema>;

const defaultFormValues: FormData = {
  phone:             '',
  email:             '',
  password:          '',
  confirmPassword:   '',
  businessName:      '',
  serviceCategories: [],
  operationalZones:  [],
};

const SERVICE_CATEGORIES = [
  { value: 'CLEANING',    label: 'Cleaning',    emoji: '🧹' },
  { value: 'MAINTENANCE', label: 'Maintenance', emoji: '🔧' },
  { value: 'LANDSCAPING', label: 'Landscaping', emoji: '🌿' },
  { value: 'SECURITY',    label: 'Security',    emoji: '🔒' },
  { value: 'PLUMBING',    label: 'Plumbing',    emoji: '🚿' },
  { value: 'ELECTRICAL',  label: 'Electrical',  emoji: '⚡' },
];

const TABS = ['Business', 'Security', 'Services'] as const;
type Tab = typeof TABS[number];

const TAB_FIELDS: Record<Tab, (keyof FormData)[]> = {
  Business: ['businessName', 'email', 'phone'],
  Security: ['password', 'confirmPassword'],
  Services: ['serviceCategories', 'operationalZones'],
};

interface ProviderRegisterFormProps {
  onSuccess: () => void;
}

export function ProviderRegisterForm({ onSuccess }: ProviderRegisterFormProps) {
  const [tab, setTab]               = useState<Tab>('Business');
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver:      zodResolver(Schema),
    defaultValues: defaultFormValues,
  });

  const passwordValue = watch('password') ?? '';
  const tabIndex      = TABS.indexOf(tab);
  const isLast        = tabIndex === TABS.length - 1;

  const goNext = async () => {
    const valid = await trigger(TAB_FIELDS[tab]);
    if (valid) setTab(TABS[tabIndex + 1]);
  };

  const goBack = () => setTab(TABS[tabIndex - 1]);

  const onSubmit = useCallback(async (data: FormData) => {
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
  }, [onSuccess]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Tab bar */}
      <div className="flex border-b border-white/10 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2',
              tab === t
                ? 'text-[var(--brand-gold)] border-[var(--brand-gold)] -mb-px'
                : 'text-white/50 hover:text-white/80 border-transparent',
            ].join(' ')}
          >
            {t}
          </button>
        ))}
      </div>

      <fieldset disabled={isSubmitting} className="border-none p-0 m-0 min-w-0 flex flex-col gap-6">
        {serverError && (
          <div className="px-4 py-3 rounded-xl bg-[var(--state-error)]/10 border border-[var(--state-error)]/30 backdrop-blur-sm">
            <p className="text-sm text-[var(--state-error)] font-medium">{serverError}</p>
          </div>
        )}

        {tab === 'Business' && (
          <>
            <div className="relative">
              <Input
                label="Business Name"
                type="text"
                autoComplete="organization"
                placeholder="Your Business Name"
                error={errors.businessName?.message}
                {...register('businessName')}
              />
            </div>

            <div className="relative">
              <Input
                label="Email Address"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="relative">
              <Input
                label="Phone Number"
                type="tel"
                autoComplete="tel"
                placeholder="+255 71x xxx xxxx"
                helper="+255 71x or +255 68x format"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>

            <Button type="button" variant="primary" size="lg" fullWidth onClick={goNext}>
              Next
            </Button>
          </>
        )}

        {tab === 'Security' && (
          <>
            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  iconRight={
                    <button type="button" tabIndex={-1} onClick={() => setShowPass((v) => !v)} aria-label="Toggle password">
                      <EyeOff className="text-[var(--brand-gold-light)]/60 hover:text-white transition-colors" size={18} />
                    </button>
                  }
                  {...register('password')}
                />
              </div>
              <PasswordStrengthMeter password={passwordValue} />
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                iconRight={
                  <button type="button" tabIndex={-1} onClick={() => setShowConfirm((v) => !v)} aria-label="Toggle confirm password">
                    <EyeOff className="text-[var(--brand-gold-light)]/60 hover:text-white transition-colors" size={18} />
                  </button>
                }
                {...register('confirmPassword')}
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={goBack}>
                Back
              </Button>
              <Button type="button" variant="primary" size="lg" className="flex-1" onClick={goNext}>
                Next
              </Button>
            </div>
          </>
        )}

        {tab === 'Services' && (
          <>
            <div>
              <label className="text-sm font-medium text-[var(--brand-gold-light)]/80 mb-2 block">
                Service Categories <span className="text-[var(--brand-gold-light)]/60">(Select all that apply)</span>
              </label>
              <Controller
                name="serviceCategories"
                control={control}
                render={({ field }) => (
                  <TagInput
                    options={SERVICE_CATEGORIES.map(opt => ({
                      value: opt.value,
                      label: `${opt.emoji} ${opt.label}`,
                    }))}
                    selected={field.value}
                    onChange={field.onChange}
                    placeholder="Select services"
                  />
                )}
              />
              {errors.serviceCategories?.message && (
                <p className="text-sm text-[var(--state-error)] mt-1">{errors.serviceCategories.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--brand-gold-light)]/80 mb-2 block">
                Operational Zones <span className="text-[var(--brand-gold-light)]/60">(Where you operate)</span>
              </label>
              <Controller
                name="operationalZones"
                control={control}
                render={({ field }) => (
                  <TagInput
                    selected={field.value}
                    onChange={field.onChange}
                    placeholder="Type a zone and press Enter…"
                  />
                )}
              />
              {errors.operationalZones?.message && (
                <p className="text-sm text-[var(--state-error)] mt-1">{errors.operationalZones.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={goBack}>
                Back
              </Button>
              <Button type="submit" loading={isSubmitting} variant="primary" size="lg" className="flex-1">
                Create Account
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-white/60">
                By registering, you agree to our{' '}
                <a href="/terms" className="text-[var(--brand-gold)] hover:text-[var(--brand-gold-light)] transition-colors">
                  Terms
                </a>{' '}
                &{' '}
                <a href="/privacy" className="text-[var(--brand-gold)] hover:text-[var(--brand-gold-light)] transition-colors">
                  Privacy
                </a>
              </p>
            </div>
          </>
        )}
      </fieldset>
    </form>
  );
}
