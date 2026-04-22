'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function AnimatedButton({
  children,
  isLoading,
  variant = 'primary',
  className,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const baseStyles = `
    relative w-full py-3.5 px-6 rounded-xl font-semibold
    flex items-center justify-center gap-2
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    overflow-hidden
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-[#C89128] to-[#E5B972] text-[#0F172A]
      hover:shadow-[0_0_30px_rgba(200,145,40,0.4)]
      active:scale-[0.98]
    `,
    secondary: `
      bg-white/10 text-white border border-white/20
      hover:bg-white/20 active:scale-[0.98]
    `,
    outline: `
      bg-transparent text-[#C89128] border border-[#C89128]
      hover:bg-[#C89128]/10 active:scale-[0.98]
    `,
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${className || ''}`}
      disabled={disabled || isLoading}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />

      {isLoading ? (
        <motion.span
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 size={20} />
          </motion.span>
          <span>Loading...</span>
        </motion.span>
      ) : (
        <motion.span
          className="relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {children}
        </motion.span>
      )}
    </motion.button>
  );
}