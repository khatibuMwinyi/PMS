'use client';

import { useEffect, useRef } from 'react';

interface GlowOrbProps {
  className: string;
  delay: number;
}

export function GlowOrb({ className, delay }: GlowOrbProps) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = divRef.current;
    if (!element) return;

    // Initial animation
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'scale(1)';
    }, delay * 1000);

    // Continuous floating animation
    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      const offset = Math.sin(time) * 20;
      const scale = 1 + Math.sin(time * 0.5) * 0.1;

      element.style.transform = `translate(${offset}px, ${offset * 0.5}px) scale(${scale})`;

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [delay]);

  return (
    <div
      ref={divRef}
      className={`absolute rounded-full transition-all duration-1000 ease-out opacity-0 ${className}`}
      style={{ transform: 'scale(0.8)' }}
    />
  );
}