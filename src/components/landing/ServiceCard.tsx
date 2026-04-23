'use client';

import { motion } from 'framer-motion';

interface ServiceCardProps {
  title: string;
  description: string;
  features: string[];
  delay?: number;
}

export function ServiceCard({ title, description, features, delay = 0 }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="landing-glass p-6 rounded-2xl relative overflow-hidden group"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#C89128]/5 to-transparent"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      <motion.div
        className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-[#C89128]/10 blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-[#64748B] dark:text-white/60 mb-5">
          {description}
        </p>
        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: delay + 0.1 * idx }}
              className="flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-[#C89128] flex-shrink-0" />
              <span className="text-[#2D3A58] dark:text-white/80 text-sm">{feature}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}