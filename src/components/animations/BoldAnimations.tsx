'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedCard({ children, className = '' }: AnimatedCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)'
      }}
      whileTap={{ scale: 0.98 }}
      className={`bg-[var(--surface-card)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-bold transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface GradientTextProps {
  children: ReactNode;
  className?: string;
}

export function GradientText({ children, className = '' }: GradientTextProps) {
  return (
    <span className={`text-gradient ${className}`}>
      {children}
    </span>
  );
}

interface PulseButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function PulseButton({ children, onClick, className = '' }: PulseButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-6 py-3 font-bold bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white rounded-[var(--radius-md)] shadow-lg hover:shadow-xl transition-all ${className}`}
    >
      {children}
    </motion.button>
  );
}