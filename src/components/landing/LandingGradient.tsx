'use client';

import { motion } from 'framer-motion';

interface LandingGradientProps {
  variant?: 'light' | 'dark';
}

export function LandingGradient({ variant = 'light' }: LandingGradientProps) {
  const isDark = variant === 'dark';
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div 
        className={`absolute inset-0 ${
          isDark 
            ? 'bg-gradient-to-br from-[#0F172A] via-[#1E3A5F] to-[#0F172A]' 
            : 'bg-gradient-to-br from-[#F8F8F9] via-[#E8ECF2] to-[#F8F8F9]'
        }`}
      />
      
      <motion.div
        className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full ${
          isDark ? 'bg-[#C89128]/10' : 'bg-[#C89128]/5'
        } blur-3xl`}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full ${
          isDark ? 'bg-[#1E3A5F]/20' : 'bg-[#DDE1E8]/20'
        } blur-3xl`}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
      
      <motion.div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full ${
          isDark ? 'bg-[#0F172A]/30' : 'bg-[#C89128]/5'
        } blur-3xl`}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <div 
        className={`absolute inset-0 ${
          isDark ? 'opacity-[0.03]' : 'opacity-[0.02]'
        }`}
        style={{
          backgroundImage: isDark 
            ? `radial-gradient(circle at 1px 1px, rgba(200, 145, 40, 0.4) 1px, transparent 0)`
            : `radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.15) 1px, transparent 0)`,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}