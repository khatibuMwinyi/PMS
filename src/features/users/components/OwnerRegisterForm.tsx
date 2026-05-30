'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeOff } from 'lucide-react';
import { OwnerRegisterSchema } from '@/features/users/types';
import { registerOwner } from '@/features/users/actions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PasswordStrengthMeter } from '@/components/shared/PasswordStrengthMeter';

const Schema = OwnerRegisterSchema.extend({
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirmPassword, {
  message:  "Passwords don't match",
  path:     ['confirmPassword'],
});

type FormData = z.infer<typeof Schema>;

const TABS = ['Personal', 'Security'] as const;
type Tab = typeof TABS[number];

const TAB_FIELDS: Record<Tab, (keyof FormData)[]> = {
  Personal: ['firstName', 'lastName', 'email', 'phone'],
  Security: ['password', 'confirmPassword'],
};

interface OwnerRegisterFormProps {
  onSuccess: () => void;
  selectedPlan?: string;
}

export function OwnerRegisterForm({ onSuccess, selectedPlan }: OwnerRegisterFormProps) {
  const [tab, setTab]               = useState<Tab>('Personal');
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(Schema) });

  const passwordValue = watch('password') ?? '';
  const tabIndex      = TABS.indexOf(tab);
  const isLast        = tabIndex === TABS.length - 1;

  const goNext = async () => {
    const valid = await trigger(TAB_FIELDS[tab]);
    if (valid) setTab(TABS[tabIndex + 1]);
  };

  const goBack = () => setTab(TABS[tabIndex - 1]);

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await registerOwner({
        email:     data.email,
        phone:     data.phone,
        password:  data.password,
        firstName: data.firstName,
        lastName:  data.lastName,
      });
      onSuccess();
    } catch (err: any) {
      setServerError(err?.message ?? 'Registration failed. Please try again.');
    }
  };

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

        {tab === 'Personal' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="First Name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Amina"
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
              </div>
              <div className="relative">
                <Input
                  label="Last Name"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Bakari"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>
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
