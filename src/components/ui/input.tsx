'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/core/lib/utils';

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export function AnimatedInput({ label, error, helper, className, ...props }: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = props.value && String(props.value).length > 0;

  return (
    <motion.div
      className="relative"
      animate={error ? { x: [0, -5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {label && (
        <motion.label
          className="absolute left-3 text-sm"
          style={{
            top: isFocused || hasValue ? '8px' : '50%',
            transform: isFocused || hasValue ? 'translateY(0) scale(0.75)' : 'translateY(-50%)',
          }}
          animate={{
            color: error ? 'var(--state-error)' : isFocused ? 'var(--brand-gold)' : 'rgba(255,255,255,0.6)',
          }}
        >
          {label}
        </motion.label>
      )}

      <input
        className={cn(
          'w-full bg-transparent border-none shadow-none outline-none'
        )}
        {...props}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {error && (
        <motion.p
          className="text-xs text-red-500 mt-1.5 ml-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
      {helper && !error && (
        <p className="text-xs text-white/40 mt-1.5 ml-1">
          {helper}
        </p>
      )}
    </motion.div>
  );
}