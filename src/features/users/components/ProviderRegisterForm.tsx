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
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: defaultFormValues,
  });

  const passwordValue = watch('password') ?? '';

  const onSubmit = useCallback(async (data: FormData) => {
    setServerError(null);
    try {
      await registerProvider({
        email:             data.email,
        phone:             data.phone,
        password:          data.password,
        businessName:      data.businessName,
        serviceCategories: data.serviceCategories,
        operationalZones: data.operationalZones,
      });
      onSuccess();
    } catch (err: any) {
      setServerError(err?.message ?? 'Registration failed. Please try again.');
    }
  }, [onSuccess]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <fieldset disabled={isSubmitting} className="border-none p-0 m-0 min-w-0 flex flex-col gap-6">

        {serverError && (
          <div className="px-4 py-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 backdrop-blur-sm">
            <p className="text-sm text-[#DC2626] font-medium">{serverError}</p>
          </div>
        )}

        {/* Business Name */}
        <div className="relative">
          <Input
            label="Business Name"
            type="text"
            autoComplete="organization"
            placeholder="Your Business Name"
            error={errors.businessName?.message}
            variant="auth"
            {...register('businessName')}
          />
        </div>

        {/* Email */}
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

        {/* Phone */}
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

        {/* Password */}
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

        {/* Confirm Password */}
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

        {/* Service Categories */}
        <div>
          <label className="text-sm font-medium text-[#E5B972]/80 mb-2 block">
            Service Categories <span className="text-[#E5B972]/60">(Select all that apply)</span>
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
            <p className="text-sm text-[#DC2626] mt-1">{errors.serviceCategories.message}</p>
          )}
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
          Create Provider Account
        </LoadingButton>

      </fieldset>
    </form>
  );
}