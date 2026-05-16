'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const LoginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginInput = z.infer<typeof LoginSchema>;

const ROLE_REDIRECT: Record<string, string> = {
  ADMIN: '/admin/services',
  OWNER: '/owner/properties',
  PROVIDER: '/provider/assignments',
  STAFF: '/staff/disputes',
};

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
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result?.ok || result.error) {
        setServerError('Invalid email or password. Please try again.');
        return;
      }

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-white mb-2">Welcome back</h1>
        <p className="text-sm text-white/55">Sign in to continue to Oweru</p>
      </header>

      {serverError && (
        <div
          role="alert"
          className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30"
        >
          <p className="text-sm text-red-300">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            className="absolute right-3 top-[38px] text-white/40 hover:text-[var(--brand-gold)] transition-colors"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex justify-end">
          <a
            href="/forgot-password"
            className="text-sm text-[var(--brand-gold)] hover:text-[var(--brand-gold-light)] transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <Button type="submit" loading={isSubmitting} variant="primary">
          Sign in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-white/12" />
        <span className="text-xs uppercase tracking-wider text-white/40">or</span>
        <div className="flex-1 h-px bg-white/12" />
      </div>

      <p className="text-center text-sm text-white/55">
        Don&apos;t have an account?{' '}
        <a
          href="/register"
          className="text-[var(--brand-gold)] font-medium hover:text-[var(--brand-gold-light)] transition-colors"
        >
          Create one
        </a>
      </p>
    </motion.div>
  );
}
