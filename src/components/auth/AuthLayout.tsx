'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { GradientBackground } from './GradientBackground';
import { AnimatedBrandingPanel } from './AnimatedBrandingPanel';
import { AnimatedFormCard } from './AnimatedFormCard';

interface AuthLayoutProps {
  children: ReactNode;
  branding?: {
    title?: string;
    tagline?: string;
  };
}

export function AuthLayout({ children, branding }: AuthLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--brand-primary)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--brand-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="auth-split bg-[var(--brand-primary)]">
      <GradientBackground />

      <motion.div
        className="auth-panel-left"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <AnimatedBrandingPanel
          title={branding?.title}
          tagline={branding?.tagline}
        />
      </motion.div>

      <motion.div
        className="auth-panel-right"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
      >
        <AnimatedFormCard>
          {children}
        </AnimatedFormCard>

        <motion.p
          className="mt-4 text-xs text-white/40 text-center w-full max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          © 2026 Oweru. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}