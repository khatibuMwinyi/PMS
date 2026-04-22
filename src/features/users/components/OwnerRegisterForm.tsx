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
      <fieldset disabled={isSubmitting} className="border-none p-0 m-0 min-w-0 flex flex-col gap-6">

        {serverError && (
          <div className="px-4 py-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 backdrop-blur-sm">
            <p className="text-sm text-[#DC2626] font-medium">{serverError}</p>
          </div>
        )}

        {/* First + Last name row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <Input
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
            <Input
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
          <Input
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
          <Input
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
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              error={errors.password?.message}
              variant="auth"
              rightElement={
                <button type="button" tabIndex={-1} onClick={() => setShowPass((v) => !v)} aria-label="Toggle password">
                  <EyeOff className="text-[#E5B972]/60 hover:text-white transition-colors" size={18} />
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
            variant="auth"
            rightElement={
              <button type="button" tabIndex={-1} onClick={() => setShowConfirm((v) => !v)} aria-label="Toggle confirm password">
                <EyeOff className="text-[#E5B972]/60 hover:text-white transition-colors" size={18} />
              </button>
            }
            {...register('confirmPassword')}
          />
        </div>

        <LoadingButton
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          loadingText="Creating account…"
          className="mt-4 bg-gradient-to-r from-[#C89128] to-[#E5B972] text-white border-0 hover:from-[#B8801A] hover:to-[#D4A76A] shadow-lg hover:shadow-[0_0_20px_rgba(200,145,40,0.4)] transform hover:scale-[1.02] transition-all duration-200"
        >
          Create Owner Account
        </LoadingButton>

      </fieldset>
    </form>
  );
}