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
    <div className="w-full max-w-[420px] animate-fade-up">
      {/* Heading */}
      <h1 className="font-display text-[28px] text-[var(--text-primary)] leading-tight mb-1">
        Welcome back
      </h1>
      <p className="text-[14px] text-[var(--text-secondary)] mb-8">
        Sign in to your Oweru account
      </p>

      {/* Server-level error */}
      {serverError && (
        <div className="mb-5 px-4 py-3 rounded-[var(--radius-md)] bg-[var(--state-error-bg)] border border-[var(--state-error)] border-opacity-30">
          <p className="text-[13px] text-[var(--state-error)]">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={isSubmitting} className="border-none p-0 m-0 min-w-0 flex flex-col gap-4">

          {/* Email */}
          <Input
            label="Email Address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Password */}
          <div className="flex flex-col gap-1">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              rightElement={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...register('password')}
            />
            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-[13px] text-[var(--brand-primary)] hover:underline"
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
            className="mt-2"
          >
            Sign In
          </LoadingButton>

        </fieldset>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        <span className="text-[13px] text-[var(--text-muted)]">or</span>
        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
      </div>

      <p className="text-center text-[14px] text-[var(--text-secondary)]">
        Don&apos;t have an account?{' '}
        <a href="/register" className="text-[var(--brand-primary)] font-medium hover:underline">
          Register →
        </a>
      </p>
    </div>
  );
}