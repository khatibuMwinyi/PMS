'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface StatCounterProps {
  value: string;
  label: string;
  icon: React.ElementType;
  delay?: number;
}

export function StatCounter({ value, label, icon: Icon, delay = 0 }: StatCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
  const suffix = value.replace(/[0-9]/g, '');
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [hasAnimated]);
  
  useEffect(() => {
    if (!hasAnimated) return;
    
    const duration = 1500;
    const steps = 50;
    const increment = numericValue / steps;
    let current = 0;
    
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setCount(numericValue);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(interval);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [hasAnimated, numericValue, delay]);
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center group"
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#DDE1E8]/50 dark:bg-[#1E3A5F]/50 flex items-center justify-center group-hover:bg-[#C89128]/20 transition-colors"
      >
        <Icon className="w-7 h-7 text-[#0F172A] dark:text-white" />
      </motion.div>
      <motion.div 
        className="text-3xl font-bold text-[#0F172A] dark:text-white mb-1"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.2 }}
      >
        {count}{suffix}
      </motion.div>
      <div className="text-sm text-[#64748B]">{label}</div>
    </motion.div>
  );
}