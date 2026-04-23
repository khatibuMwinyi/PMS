'use client';

import { motion } from 'framer-motion';

const SHAPES = [
  { size: 100, x: '5%', y: '15%', delay: 0 },
  { size: 60, x: '85%', y: '20%', delay: 1 },
  { size: 80, x: '15%', y: '70%', delay: 2 },
  { size: 40, x: '75%', y: '75%', delay: 0.5 },
  { size: 50, x: '45%', y: '10%', delay: 3 },
];

export function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {SHAPES.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#C89128]/10"
          style={{
            left: shape.x,
            top: shape.y,
            width: shape.size,
            height: shape.size,
          }}
          animate={{
            y: [-25, 25, -25],
            x: [-15, 15, -15],
            rotate: [0, 180, 360],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 7 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: shape.delay,
          }}
        />
      ))}
      
      <motion.div
        className="absolute top-20 right-1/4 w-16 h-16 rounded-2xl bg-[#C89128]/8 rotate-12"
        animate={{
          y: [-20, 20, -20],
          rotate: [12, 30, 12],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
      
      <motion.div
        className="absolute bottom-32 left-1/4 w-12 h-12 rounded-full bg-[#1E3A5F]/20 dark:bg-[#C89128]/10"
        animate={{
          y: [15, -15, 15],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />
    </div>
  );
}