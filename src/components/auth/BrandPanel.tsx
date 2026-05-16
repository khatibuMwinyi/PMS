'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Zap, Shield } from 'lucide-react';

interface BrandPanelProps {
  title?: string;
  tagline?: string;
}

const FEATURES = [
  {
    Icon: Home,
    label: 'Property Management',
    description: 'Professional services tracked in real-time',
  },
  {
    Icon: Zap,
    label: 'Instant Quotes',
    description: 'Get price estimates within seconds',
  },
  {
    Icon: Shield,
    label: 'Secure Payments',
    description: 'Pay safely via Selcom mobile money',
  },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
};

export function BrandPanel({ title = 'Oweru', tagline = 'Your property, professionally managed' }: BrandPanelProps) {
  return (
    <motion.div
      className="relative z-10 w-full max-w-md mx-auto lg:mx-0"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={item} className="mb-6 lg:mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/65 hover:text-white transition-colors group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>
      </motion.div>

      <motion.div variants={item} className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/15 flex-shrink-0">
          <Image
            src="/images/logo.jpeg"
            alt="Oweru logo"
            fill
            sizes="(max-width: 640px) 44px, 56px"
            className="object-cover"
          />
        </div>
        <span
          className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--brand-gold)]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {title}
        </span>
      </motion.div>

      <motion.p
        variants={item}
        className="text-base sm:text-lg text-white/85 leading-relaxed mb-2 lg:mb-10"
      >
        {tagline}
      </motion.p>

      {/* Feature list — desktop only (lg ≥1024px) */}
      <motion.ul variants={item} className="hidden lg:block space-y-5 mt-8">
        {FEATURES.map(({ Icon, label, description }) => (
          <motion.li key={label} variants={item} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/[0.08] ring-1 ring-white/[0.12] flex items-center justify-center">
              <Icon size={18} className="text-[var(--brand-gold)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-sm text-white/55 leading-snug">{description}</p>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}
