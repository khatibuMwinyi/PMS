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
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C89128] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <AnimatePresence mode="wait">
        <motion.div
          key="auth-layout"
          className="w-full min-h-screen grid lg:grid-cols-[1.5fr_1fr] bg-[#0F172A]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GradientBackground />

          <motion.div
            className="auth-panel-left"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <AnimatedBrandingPanel
              title={branding?.title}
              tagline={branding?.tagline}
            />
          </motion.div>

          <motion.div
            className="auth-panel-right"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          >
            <AnimatedFormCard>
              {children}
            </AnimatedFormCard>

            <motion.p
              className="mt-6 text-sm text-white/40 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              © 2026 Oweru. All rights reserved.
            </motion.p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}