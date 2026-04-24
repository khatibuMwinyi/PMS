'use client';

import { motion } from 'framer-motion';
import { useState, cn } from 'react';

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
          className="absolute left-3 text-sm transition-all duration-200 pointer-events-none"
          style={{
            top: isFocused || hasValue ? '8px' : '50%',
            transform: isFocused || hasValue ? 'translateY(0) scale(0.75)' : 'translateY(-50%)',
            transformOrigin: 'left',
            color: error ? 'var(--state-error)' : isFocused ? 'var(--brand-gold)' : 'rgba(255,255,255,0.6)',
          }}
          animate={{
            color: error ? 'var(--state-error)' : isFocused ? 'var(--brand-gold)' : 'rgba(255,255,255,0.6)',
          }}
        >
          {label}
        </motion.label>
      )}

      <div
        className={cn(
          'relative flex items-center',
          'focus-within:ring-2 focus-within:ring-[var(--brand-gold)] focus-within:ring-offset-2 focus-within:rounded-xl',
          error && 'focus-within:ring-[var(--state-error)]',
        )}
      >
        <input
          className={cn(
            'w-full bg-transparent border-none shadow-none outline-none ring-none',
            'text-white placeholder:text-transparent',
            'transition-all duration-200',
            className,
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={isFocused ? { opacity: 1 } : { opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 border-2 border-[var(--brand-gold)]/30 rounded-xl"
            initial={{ scaleX: 0 }}
            animate={isFocused ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </div>

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
        <p className="text-xs text-white/40 mt-1.5 ml-1">{helper}</p>
      )}
    </motion.div>
  );
}