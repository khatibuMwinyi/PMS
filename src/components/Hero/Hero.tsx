'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeroProps {
  title: string;
  subtitle: string;
  bgImage?: string;
  onGetStarted?: () => void;
}

const HERO_IMAGES = {
  placeholder: '/oweru.jpeg',
  default: '/uploads/properties/zBuYbVCaGxVJK7wF3CmPV-pexels-angelo-perez-343619529-14083659.jpg'
};

export default function Hero({
  title,
  subtitle,
  bgImage = HERO_IMAGES.placeholder,
  onGetStarted
}: HeroProps): JSX.Element {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-[50vh] flex items-center">
      <div className="absolute inset-0">
        <Image src={bgImage} alt="Property management background" fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-primary)]/80 via-[var(--brand-primary)]/60 to-[var(--brand-primary)]/80"/>
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0.1 : 0.8,
            delay: 0.1
          }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: prefersReducedMotion ? 0.1 : 0.6,
              delay: 0.2
            }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <div className="w-1 h-8 bg-[var(--brand-gold)] rounded"/>
            <span className="text-sm font-semibold text-white/80 uppercase tracking-wide">
              Professional Property Management
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {title.split(' ').map((word, idx) => (
              <span
                key={idx}
                className={word.toLowerCase() === 'property' ? 'text-[var(--brand-gold)]' : ''}
              >
                {word}
              </span>
            ))}
          </h1>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            {subtitle}
          </p>

          <motion.button
            whileHover={!prefersReducedMotion ? { scale: 1.05 } : undefined}
            whileTap={!prefersReducedMotion ? { scale: 0.95 } : undefined}
            onClick={onGetStarted}
            className="px-8 py-4 bg-gradient-to-r from-[var(--brand-gold)] to-[var(--brand-gold-light)] text-[var(--brand-primary)] rounded-lg font-semibold shadow-lg hover:shadow-xl hover:shadow-[var(--brand-gold)]/30 transition-all"
            aria-label="Get started"
          >
            Get Started
            <ArrowRight className="inline ml-2 w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}