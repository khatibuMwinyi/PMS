'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, Zap, Home as HomeIcon, Building2, ArrowLeft } from 'lucide-react';

interface AnimatedBrandingPanelProps {
  title?: string;
  tagline?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 100,
    },
  },
};

const logoVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 100,
    },
  },
};

const FEATURES = [
  {
    icon: <HomeIcon size={20} className="text-[#C89128]" />,
    label: 'Property Management',
    description: 'Professional services tracked in real-time',
  },
  {
    icon: <Zap size={20} className="text-[#C89128]" />,
    label: 'Instant Quotes',
    description: 'Get price estimates within seconds',
  },
  {
    icon: <Shield size={20} className="text-[#C89128]" />,
    label: 'Secure Payments',
    description: 'Pay safely via mobile money',
  },
  {
    icon: <Building2 size={20} className="text-[#C89128]" />,
    label: 'Provider Ratings',
    description: 'Choose from rated professionals',
  },
];

export function AnimatedBrandingPanel({ title = 'Oweru', tagline }: AnimatedBrandingPanelProps) {
  return (
    <div className="relative h-full flex items-center justify-center p-8 lg:p-12 overflow-hidden">
      <FloatingShapes />
      
      <motion.div
        className="relative z-10 max-w-md space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to home
          </Link>
        </motion.div>

        <motion.div variants={logoVariants} className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/images/logo.jpeg"
              alt="Oweru Logo"
              fill
              className="object-cover"
            />
          </div>
          <motion.span 
            className="text-4xl font-bold text-gradient-white tracking-tight"
            variants={itemVariants}
          >
            {title}
          </motion.span>
        </motion.div>

        <motion.p 
          variants={itemVariants}
          className="text-lg text-white/80 leading-relaxed"
        >
          {tagline || 'Your property, professionally managed'}
        </motion.p>

        <motion.div variants={itemVariants} className="space-y-5 pt-4">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-4"
              variants={itemVariants}
              whileHover={{ x: 10 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#C89128]/10 flex items-center justify-center">
                {feature.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{feature.label}</p>
                <p className="text-xs text-white/60">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="pt-4"
        >
          <div className="flex gap-2">
            {['★', '★', '★', '★', '★'].map((star, i) => (
              <motion.span
                key={i}
                className="text-[#C89128]"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                {star}
              </motion.span>
            ))}
            <span className="text-xs text-white/60 ml-2">Trusted by 10,000+ property owners</span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#C89128]/5 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#C89128]/5"
        animate={{
          y: [-30, 30, -30],
          x: [-20, 20, -20],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-[#1E3A5F]/20"
        animate={{
          y: [20, -20, 20],
          x: [15, -15, 15],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}