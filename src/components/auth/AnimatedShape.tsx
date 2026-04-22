'use client';

import { useEffect, useRef } from 'react';

interface AnimatedShapeProps {
  className: string;
  delay: number;
  duration: number;
}

export function AnimatedShape({ className, delay, duration }: AnimatedShapeProps) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = divRef.current;
    if (!element) return;

    // Initial animation
    setTimeout(() => {
      element.style.opacity = '1';
    }, delay * 1000);

    // Continuous rotation animation
    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      const rotation = (time / duration) * 360;

      element.style.transform = `rotate(${rotation}deg)`;

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [delay, duration]);

  return (
    <div
      ref={divRef}
      className={`absolute transition-all duration-1000 ease-out opacity-0 ${className}`}
      style={{ transform: 'rotate(0deg)' }}
    />
  );
}