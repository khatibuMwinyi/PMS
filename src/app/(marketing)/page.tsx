'use client';

import { useState, useEffect } from 'react';
import DebugPreview from './debug-preview';
import { motion } from 'framer-motion';
import { ArrowRight, Palette, Eye } from 'lucide-react';
import { GradientText, AnimatedCard } from '@/components/animations/BoldAnimations';
import { useDevice } from '@/components/hooks/useDevice';

export default function MarketingPage() {
  const device = useDevice();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      title: "Smart Property Management",
      description: "AI-powered solutions for seamless property operations",
      icon: Palette
    },
    {
      title: "Real-Time Analytics",
      description: "Track performance metrics and insights",
      icon: Eye
    },
    {
      title: "Seamless Integration",
      description: "Connect with all your favorite tools",
      icon: ArrowRight
    }
  ];

  const stats = [
    { value: "1000+", label: "Properties Managed" },
    { value: "98%", label: "Client Satisfaction" },
    { value: "24/7", label: "Support Available" },
    { value: "50ms", label: "Response Time" }
  ];

  const isMobile = device === 'mobile' && mounted;

  return (
    <>
      {/* Hero Section with Background Image and Blue Gradient Overlay */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/uploads/properties/zBuYbVCaGxVJK7wF3CmPV-pexels-angelo-perez-343619529-14083659.jpg')" }}
        />
        
        {/* Semi-transparent Blue Gradient Overlay */}
        {isMobile ? (
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-primary)]/80 via-[var(--brand-primary-dark)]/60 to-[var(--brand-primary)]/80" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-primary)]/70 via-[var(--brand-secondary)]/50 to-[var(--brand-primary)]/70" />
        )}

        {/* Animated Background Blobs */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--brand-gold)] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float z-0"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--brand-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float z-0"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />

        {/* Main Content */}
        <div className={`relative z-10 w-full ${isMobile ? 'px-4 py-16' : 'max-w-6xl mx-auto px-6'}`}>
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={isMobile ? 'mb-8 text-center' : 'mb-12 text-center'}
          >
            <h1 className={`font-bold mb-4 leading-none text-white ${isMobile ? 'text-3xl' : 'text-6xl md:text-8xl'}`}>
              Property <span className="gradient-text">Reimagined</span>
            </h1>
            <p className={`text-white mb-6 opacity-90 ${isMobile ? 'text-base max-w-xs mx-auto' : 'text-2xl md:text-3xl max-w-2xl mx-auto'}`}>
              Transform your property experience with our revolutionary platform
            </p>
          </motion.div>

          {/* Desktop Features Grid */}
          {!isMobile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    y: -10,
                    backgroundColor: "var(--surface-overlay)"
                  }}
                >
                  <AnimatedCard className="p-8 cursor-pointer">
                    <div className="w-16 h-16 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-gold)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-[var(--text-primary)] mb-3 text-xl">{feature.title}</h3>
                    <p className="text-[var(--text-secondary)]">{feature.description}</p>
                  </AnimatedCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* Mobile Features - Simplified */}
          {isMobile && (
            <div className="flex gap-4 overflow-x-auto pb-4 mb-8 -mx-4 px-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-64 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-gold)] rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-white mb-2 text-lg">{feature.title}</h3>
                  <p className="text-white/80 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Stats Section */}
          <motion.section
            className={`${isMobile ? 'py-10 mb-8' : 'py-20 mb-16'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'}`}>
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="text-center group cursor-pointer"
                >
                  <div className={`font-bold text-gradient mb-2 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>{stat.value}</div>
                  <div className="text-white font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={isMobile ? 'text-center' : 'mb-12'}
          >
            <GradientText className={`font-bold mb-6 block text-white ${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'}`}>
              Ready to Transform Your Property Management?
            </GradientText>
            <motion.button
              whileHover={{
                scale: 1.05,
                background: "var(--gradient-accent)",
                color: "var(--text-on-dark)"
              }}
              whileTap={{ scale: 0.95 }}
              className={`font-bold text-white rounded-full shadow-2xl hover:shadow-3xl transition-all bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] ${isMobile ? 'px-8 py-3 text-base' : 'px-12 py-6 text-lg'}`}
            >
              Get Started
              <ArrowRight className="inline ml-3 w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>
      </div>
      <DebugPreview />
    </>
  );
}