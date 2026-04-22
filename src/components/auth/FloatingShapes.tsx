'use client';

import { motion } from 'framer-motion';

const SHAPES = [
  { size: 120, x: '10%', y: '20%', delay: 0 },
  { size: 80, x: '80%', y: '30%', delay: 1 },
  { size: 60, x: '30%', y: '70%', delay: 2 },
  { size: 100, x: '70%', y: '80%', delay: 0.5 },
  { size: 40, x: '15%', y: '60%', delay: 1.5 },
  { size: 90, x: '85%', y: '15%', delay: 3 },
  { size: 50, x: '50%', y: '10%', delay: 2.5 },
  { size: 70, x: '5%', y: '85%', delay: 4 },
];

export function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {SHAPES.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-[#C89128]/10 to-[#C89128]/5"
          style={{
            left: shape.x,
            top: shape.y,
            width: shape.size,
            height: shape.size,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: shape.delay,
          }}
        />
      ))}

      <motion.div
        className="absolute top-10 left-1/2 w-32 h-32 rounded-2xl bg-[#C89128]/8 rotate-12"
        animate={{
          y: [-15, 15, -15],
          rotate: [12, 24, 12],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      <motion.div
        className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-[#1E3A5F]/30"
        animate={{
          y: [10, -10, 10],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />
    </div>
  );
}