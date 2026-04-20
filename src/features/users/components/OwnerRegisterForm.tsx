'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { OwnerRegisterSchema } from '@/features/users/types';
import { registerOwner } from '@/features/users/actions';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/shared/LoadingButton';
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
      <fieldset disabled={isSubmitting} className="border-none p-0 m-0 min-w-0 flex flex-col gap-4">

        {serverError && (
          <div className="px-4 py-3 rounded-[var(--radius-md)] bg-[var(--state-error-bg)]">
            <p className="text-[13px] text-[var(--state-error)]">{serverError}</p>
          </div>
        )}

        {/* First + Last name row */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            type="text"
            autoComplete="given-name"
            placeholder="Amina"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            type="text"
            autoComplete="family-name"
            placeholder="Bakari"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

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

        {/* Password + strength meter */}
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
            <button type="button" tabIndex={-1} onClick={() => setShowConfirm((v) => !v)} aria-label="Toggle confirm password">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          {...register('confirmPassword')}
        />

        <LoadingButton
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          loadingText="Creating account…"
          className="mt-1"
        >
          Create Owner Account
        </LoadingButton>

      </fieldset>
    </form>
  );
}