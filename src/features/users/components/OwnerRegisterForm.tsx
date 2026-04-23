'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { OwnerRegisterSchema } from '@/features/users/types';
import { registerOwner } from '@/features/users/actions';
import { UnifiedInput } from '@/components/ui/UnifiedInput';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { PasswordStrengthMeter } from '@/components/shared/PasswordStrengthMeter';

// Extend schema to add confirmPassword
const Schema = OwnerRegisterSchema.extend({
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirmPassword, {
  message:  "Passwords don't match",
  path:     ['confirmPassword'],
});

type FormData = z.infer<typeof Schema>;

interface OwnerRegisterFormProps {
  onSuccess: () => void;
}

export function OwnerRegisterForm({ onSuccess }: OwnerRegisterFormProps) {
  const [showPass, setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(Schema) });

  const passwordValue = watch('password') ?? '';

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
      <fieldset disabled={isSubmitting} className="border-none p-0 m-0 min-w-0 flex flex-col gap-6">

        {serverError && (
          <div className="px-4 py-3 rounded-xl bg-[var(--state-error)]/10 border border-[var(--state-error)]/30 backdrop-blur-sm">
            <p className="text-sm text-[var(--state-error)] font-medium">{serverError}</p>
          </div>
        )}

        {/* First + Last name row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <UnifiedInput
              label="First Name"
              type="text"
              autoComplete="given-name"
              placeholder="Amina"
              error={errors.firstName?.message}
              variant="auth"
              {...register('firstName')}
            />
          </div>
          <div className="relative">
            <UnifiedInput
              label="Last Name"
              type="text"
              autoComplete="family-name"
              placeholder="Bakari"
              error={errors.lastName?.message}
              variant="auth"
              {...register('lastName')}
            />
          </div>
        </div>

        <div className="relative">
          <UnifiedInput
            label="Email Address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            variant="auth"
            {...register('email')}
          />
        </div>

        <div className="relative">
          <UnifiedInput
            label="Phone Number"
            type="tel"
            autoComplete="tel"
            placeholder="+255 71x xxx xxxx"
            helper="+255 71x or +255 68x format"
            error={errors.phone?.message}
            variant="auth"
            {...register('phone')}
          />
        </div>

        {/* Password + strength meter */}
        <div>
          <div className="relative">
            <UnifiedInput
              label="Password"
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              error={errors.password?.message}
              variant="auth"
              rightElement={
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
          <UnifiedInput
            label="Confirm Password"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            variant="auth"
            rightElement={
              <button type="button" tabIndex={-1} onClick={() => setShowConfirm((v) => !v)} aria-label="Toggle confirm password">
                <EyeOff className="text-[var(--brand-gold-light)]/60 hover:text-white transition-colors" size={18} />
              </button>
            }
            {...register('confirmPassword')}
          />
        </div>

        <UnifiedButton
          type="submit"
          state={isSubmitting ? 'loading' : 'default'}
          variant="primary"
          size="lg"
          fullWidth
          className="mt-4"
          leftIcon={isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : undefined}
        >
          Create Owner Account
        </UnifiedButton>

      </fieldset>
    </form>
  );
}