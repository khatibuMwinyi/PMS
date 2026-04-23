'use client';

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="relative w-12 h-12 rounded-full bg-[#DDE1E8]/50 dark:bg-[#1E3A5F]/50 flex items-center justify-center overflow-hidden transition-colors hover:bg-[#C89128]/20"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0, rotate: 180, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        key={theme}
        className="absolute"
      >
        {theme === 'light' ? (
          <Sun size={20} className="text-[#C89128]" />
        ) : (
          <Moon size={20} className="text-[#C89128]" />
        )}
      </motion.div>
    </button>
  );
}