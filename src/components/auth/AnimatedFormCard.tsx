'use client';

import { motion } from 'framer-motion';

interface AnimatedFormCardProps {
  children: React.ReactNode;
}

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 100,
      delay: 0.2,
    },
  },
};

export function AnimatedFormCard({ children }: AnimatedFormCardProps) {
  return (
    <motion.div
      className="w-full max-w-md relative"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="glass-card p-6 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#C89128]/5 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        />
        
        <div className="relative z-10">
          {children}
        </div>

        <motion.div
          className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-[#C89128]/10 blur-2xl"
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
      </div>
    </motion.div>
  );
}