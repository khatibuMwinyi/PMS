'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { UnifiedInput } from '@/components/ui/UnifiedInput';
import { UnifiedButton } from '@/components/ui/UnifiedButton';

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
      className="w-full space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-sm text-white/60">Sign in to continue to Oweru</p>
      </motion.div>

      {serverError && (
        <motion.div
          className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <p className="text-sm text-red-400">{serverError}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <UnifiedInput
            label="Email Address"
            type="email"
            autoComplete="email"
            state={errors.email ? 'error' : 'default'}
            error={errors.email?.message}
            {...register('email')}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />

          <div className="relative">
            <UnifiedInput
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              state={errors.password ? 'error' : 'default'}
              error={errors.password?.message}
              {...register('password')}
              leftIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[var(--brand-gold)] transition-colors"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-sm text-[var(--brand-gold)] hover:text-[var(--brand-gold-light)] transition-colors"
            >
              Forgot password?
            </a>
          </div>

          <UnifiedButton
            type="submit"
            state={isSubmitting ? 'loading' : 'default'}
            variant="primary"
            className="mt-2"
            leftIcon={isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : undefined}
          >
            Sign In
          </UnifiedButton>
        </motion.div>
      </form>

      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--brand-gold)]/30 to-transparent" />
        <span className="text-xs text-white/40">or</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--brand-gold)]/30 to-transparent" />
      </motion.div>

      <motion.p
        className="text-center text-sm text-white/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        Don&apos;t have an account?{' '}
        <a href="/register" className="text-[var(--brand-gold)] font-medium hover:text-[var(--brand-gold-light)] transition-colors">
          Register →
        </a>
      </motion.p>
    </motion.div>
  );
}