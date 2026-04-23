'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ShimmerButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  href?: string;
}

export function ShimmerButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled,
  href,
}: ShimmerButtonProps) {
  const baseStyles = `
    relative inline-flex items-center justify-center gap-2 px-8 py-4 
    rounded-xl font-semibold overflow-hidden
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-300
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-[#C89128] to-[#E5B972] 
      text-[#0F172A] 
      hover:shadow-[0_0_30px_rgba(200,145,40,0.4)]
      dark:from-[#C89128] dark:to-[#E5B972] dark:text-[#0F172A]
    `,
    secondary: `
      bg-[#0F172A] dark:bg-[#1E3A5F]
      text-white
      hover:bg-[#1E293B] dark:hover:bg-[#2D4A6F]
    `,
    outline: `
      bg-transparent 
      border-2 border-[#C89128] 
      text-[#C89128]
      hover:bg-[#C89128]/10
    `,
  };

  const buttonContent = (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );

  if (href) {
    return (
      <a href={href} className="inline-flex">
        {buttonContent}
      </a>
    );
  }

  return buttonContent;
}