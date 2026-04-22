'use client';

import DebugPreview from './debug-preview';
import { motion } from 'framer-motion';
import { ArrowRight, Palette, Eye } from 'lucide-react';
import { GradientText, AnimatedCard } from '@/components/animations/BoldAnimations';

export default function MarketingPage() {
  const features = [
    {
      title: “Smart Property Management”,
      description: “AI-powered solutions for seamless property operations”,
      icon: Palette
    },
    {
      title: “Real-Time Analytics”,
      description: “Track performance metrics and insights”,
      icon: Eye
    },
    {
      title: “Seamless Integration”,
      description: “Connect with all your favorite tools”,
      icon: ArrowRight
    }
  ];

  const stats = [
    { value: “1000+”, label: “Properties Managed” },
    { value: “98%”, label: “Client Satisfaction” },
    { value: “24/7”, label: “Support Available” },
    { value: “50ms”, label: “Response Time” }
  ];

  return (
    <>
      {/* Animated Background */}
      <div className=”fixed inset-0 z-0 overflow-hidden”>
        <motion.div
          className=”absolute -top-40 -right-40 w-80 h-80 bg-[var(--brand-gold)] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float”
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className=”absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--brand-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float”
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
        <motion.div
          className=”absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[var(--brand-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float”
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 4 }}
        />
      </div>

      {/* Main Content */}
      <div className=”min-h-screen bg-[var(--surface-page)] flex items-center justify-center relative”>
        <div className=”text-center max-w-6xl mx-auto px-6”>
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className=”mb-12”
          >
            <h1 className=”text-6xl md:text-8xl font-bold mb-6 leading-none”>
              Property <span className=”gradient-text”>Reimagined</span>
            </h1>
            <p className=”text-2xl md:text-3xl text-[var(--text-primary)] mb-8 max-w-2xl mx-auto opacity-90”>
              Transform your property experience with our revolutionary platform
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className=”grid grid-cols-1 md:grid-cols-3 gap-8 mb-16”>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  backgroundColor: “var(--surface-overlay)”
                }}
              >
                <AnimatedCard className=”p-8 cursor-pointer”>
                  <div className=”w-16 h-16 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-gold)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg”>
                    <feature.icon className=”w-8 h-8 text-white” />
                  </div>
                  <h3 className=”font-bold text-[var(--text-primary)] mb-3 text-xl”>{feature.title}</h3>
                  <p className=”text-[var(--text-secondary)]”>{feature.description}</p>
                </AnimatedCard>
              </motion.div>
            ))}
          </div>

          {/* Stats Section */}
          <motion.section
            className=”py-20 mb-16”
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className=”grid grid-cols-2 md:grid-cols-4 gap-8”>
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className=”text-center group cursor-pointer”
                >
                  <div className=”text-5xl font-bold text-gradient mb-2”>{stat.value}</div>
                  <div className=”text-[var(--text-primary)] font-medium”>{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className=”mb-12”
          >
            <GradientText className=”text-2xl md:text-3xl font-bold mb-8 block”>
              Ready to Transform Your Property Management?
            </GradientText>
            <motion.button
              whileHover={{
                scale: 1.05,
                background: “var(--gradient-accent)”,
                color: “var(--text-on-dark)”
              }}
              whileTap={{ scale: 0.95 }}
              className=”px-12 py-6 text-lg font-bold bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white rounded-full shadow-2xl hover:shadow-3xl transition-all”
            >
              Get Started
              <ArrowRight className=”inline ml-3 w-6 h-6” />
            </motion.button>
          </motion.div>
        </div>
      </div>
      <DebugPreview />
    </>
  );
}
