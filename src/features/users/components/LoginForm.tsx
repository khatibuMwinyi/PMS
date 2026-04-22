'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/shared/LoadingButton';

// ─── Schema ──────────────────────────────────────────────────────────
const LoginSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginInput = z.infer<typeof LoginSchema>;

// ─── Role → destination map ───────────────────────────────────────────
const ROLE_REDIRECT: Record<string, string> = {
  ADMIN:    '/admin/services',
  OWNER:    '/owner/properties',
  PROVIDER: '/provider/assignments',
  STAFF:    '/staff/disputes',
};

// ─── Component ────────────────────────────────────────────────────────
export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const result = await signIn('credentials', {
        email:    data.email,
        password: data.password,
        redirect: false,
      });

      if (!result?.ok || result.error) {
        setServerError('Invalid email or password. Please try again.');
        return;
      }

      // After successful sign‑in, fetch the session to determine the user's role and redirect accordingly
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      const userRole = session?.user?.role as string | undefined;
      const dest = userRole ? (ROLE_REDIRECT[userRole] ?? '/') : '/';
      router.replace(dest);
    } catch {
      setServerError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Server-level error */}
      {serverError && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 backdrop-blur-sm">
          <p className="text-sm text-[#DC2626] font-medium">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={isSubmitting} className="border-none p-0 m-0 min-w-0 flex flex-col gap-6">

          {/* Email */}
          <div className="relative">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              className="bg-black/30 border-[#E5B972]/20 text-white placeholder-[#E5B972]/40 focus:border-[#C89128] focus:ring-[#C89128]/20"
              {...register('email')}
            />
            <div className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-r from-[#C89128]/0 via-[#C89128]/0 to-[#C89128]/0 hover:from-[#C89128]/5 hover:to-[#C89128]/5 transition-all duration-300" />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.password?.message}
                className="bg-black/30 border-[#E5B972]/20 text-white placeholder-[#E5B972]/40 focus:border-[#C89128] focus:ring-[#C89128]/20"
                rightElement={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-[#E5B972]/60 hover:text-white transition-colors p-2"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                {...register('password')}
              />
              <div className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-r from-[#C89128]/0 via-[#C89128]/0 to-[#C89128]/0 hover:from-[#C89128]/5 hover:to-[#C89128]/5 transition-all duration-300" />
            </div>
            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-sm text-[#C89128] hover:text-[#E5B972] transition-colors font-medium"
              >
                Forgot password?
              </a>
            </div>
          </div>

          {/* Submit */}
          <LoadingButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            loadingText="Signing in…"
            className="mt-4 bg-gradient-to-r from-[#C89128] to-[#E5B972] text-white border-0 hover:from-[#B8801A] hover:to-[#D4A76A] shadow-lg hover:shadow-[0_0_20px_rgba(200,145,40,0.4)] transform hover:scale-[1.02] transition-all duration-200"
          >
            Sign In
          </LoadingButton>

        </fieldset>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E5B972]/30 to-transparent" />
        <span className="text-sm text-[#E5B972]/60">or</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E5B972]/30 to-transparent" />
      </div>

      <p className="text-center text-sm text-[#E5B972]/80">
        Don&apos;t have an account?{' '}
        <a href="/register" className="text-white font-medium hover:text-[#E5B972] transition-colors">
          Register →
        </a>
      </p>
    </div>
  );
}