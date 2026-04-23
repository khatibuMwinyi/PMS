'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Building2, Users, Shield, TrendingUp, Clock, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDevice } from '@/components/hooks/useDevice';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LandingGradient } from '@/components/landing/LandingGradient';
import { FloatingShapes } from '@/components/landing/FloatingShapes';
import { StatCounter } from '@/components/landing/StatCounter';
import { ServiceCard } from '@/components/landing/ServiceCard';
import { ShimmerButton } from '@/components/ui/ShimmerButton';

export default function LandingPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState('owners');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const device = useDevice();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const isMobile = device === 'mobile' && mounted;

  const handleSignIn = (role: string) => {
    router.push('/login');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const heroWords = "Manage Properties, Not Headaches".split(' ');

  const roles = [
    { role: 'owner', title: 'Hands-Off Property Ownership', description: 'Maximize your property value with professional management', icon: Building2 },
    { role: 'provider', title: 'Get Paid, Not Pulled Around', description: 'Grow your business with verified property connections', icon: Users },
    { role: 'admin', title: 'Oversee Everything', description: 'Full platform control and analytics', icon: Shield },
  ];

  const stats = [
    { value: '500+', label: 'Properties', icon: Building2 },
    { value: '200+', label: 'Providers', icon: Users },
    { value: '10K+', label: 'Transactions', icon: TrendingUp },
    { value: '2hrs', label: 'Response Time', icon: Clock },
  ];

  const services = [
    {
      title: 'Property Management',
      description: 'Comprehensive solutions for property owners across Tanzania',
      features: ['Rental Collection', 'Maintenance Coordination', 'Tenant Relations'],
    },
    {
      title: 'Service Provider Network',
      description: 'Connect with verified service professionals',
      features: ['Background Checks', 'Performance Tracking', 'Secure Payments'],
    },
    {
      title: 'Financial Services',
      description: 'Transparent financial management and reporting',
      features: ['Digital Payments', 'Expense Tracking', 'Revenue Reports'],
    },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-[#F8F8F9]'}`}>
      <LandingGradient variant={theme} />
      <FloatingShapes />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 nav-glass z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/images/logo.jpeg"
                  alt="Oweru Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xl font-bold text-[#0F172A] dark:text-white">Oweru</span>
            </motion.div>

            {!isMobile && (
              <div className="flex items-center gap-6">
                <a href="#features" className="text-[#2D3A58] dark:text-white/80 hover:text-[#C89128] transition-colors text-sm font-medium">Features</a>
                <a href="#" className="text-[#2D3A58] dark:text-white/80 hover:text-[#C89128] transition-colors text-sm font-medium">Pricing</a>
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
                <ShimmerButton onClick={() => handleSignIn('user')} variant="primary" className="py-2 px-4 text-sm">
                  Sign In
                </ShimmerButton>
              </div>
            )}

            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-[#2D3A58] dark:text-white hover:bg-[#DDE1E8]/50 dark:hover:bg-[#1E3A5F]/50 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-y-0 right-0 z-50 w-72 bg-white dark:bg-[#0F172A] shadow-xl"
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-[#DDE1E8] dark:border-[#1E3A5F]">
                <span className="text-lg font-bold text-[#0F172A] dark:text-white">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-[#DDE1E8]/50 dark:hover:bg-[#1E3A5F]/50 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#2D3A58] dark:text-white">Features</a>
                <a href="#" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#2D3A58] dark:text-white">Pricing</a>
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
                <ShimmerButton onClick={() => { setMobileMenuOpen(false); handleSignIn('user'); }} variant="primary" className="w-full justify-center">
                  Sign In
                </ShimmerButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <div className="w-1 h-8 bg-[#C89128] rounded"></div>
              <span className="text-sm font-semibold text-[#2D3A58] dark:text-white/80 uppercase tracking-widest">Tanzania's Premier Property Platform</span>
            </motion.div>

            <h1 className="landing-title text-[#0F172A] dark:text-white mb-6">
              {heroWords.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                  className="inline-block mr-3"
                >
                  {i === 1 ? <span className="text-gradient">{word}</span> : word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-lg text-[#2D3A58] dark:text-white/60 mb-10 max-w-2xl mx-auto"
            >
              The smart way to manage properties and connect with service providers across Tanzania
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <ShimmerButton onClick={() => handleSignIn('user')} variant="primary">
                Get Started <ArrowRight className="w-5 h-5" />
              </ShimmerButton>
              <ShimmerButton href="#features" variant="outline">
                Explore Features
              </ShimmerButton>
            </motion.div>
          </motion.div>

          {/* Role Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
          >
            {roles.map((item, index) => (
              <motion.div
                key={item.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + 0.1 * index }}
                whileHover={{ scale: 1.03, y: -8 }}
                className="role-card p-8 rounded-2xl cursor-pointer text-center group"
                onClick={() => handleSignIn(item.role)}
              >
                <div className="w-16 h-16 mx-auto mb-5 bg-[#DDE1E8]/50 dark:bg-[#1E3A5F]/50 rounded-xl flex items-center justify-center group-hover:bg-[#C89128]/20 transition-colors">
                  <item.icon className="w-8 h-8 text-[#0F172A] dark:text-white group-hover:text-[#C89128]" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-[#64748B] dark:text-white/60 mb-4">{item.description}</p>
                <span className="text-sm font-medium text-[#C89128]">Sign In →</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 px-8 rounded-3xl bg-[#0F172A]/5 dark:bg-[#0F172A]/30"
          >
            {stats.map((stat, index) => (
              <StatCounter
                key={index}
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
                delay={index * 0.2}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Tabs */}
      <section className="py-20 bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center mb-12">
            <div className="bg-[#DDE1E8]/50 dark:bg-[#1E3A5F]/50 rounded-full p-1 flex">
              <button
                onClick={() => setActiveTab('owners')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'owners'
                    ? 'bg-[#0F172A] dark:bg-[#C89128] text-white dark:text-[#0F172A]'
                    : 'text-[#2D3A58] dark:text-white hover:text-[#0F172A] dark:hover:text-[#C89128]'
                }`}
              >
                For Property Owners
              </button>
              <button
                onClick={() => setActiveTab('providers')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'providers'
                    ? 'bg-[#0F172A] dark:bg-[#C89128] text-white dark:text-[#0F172A]'
                    : 'text-[#2D3A58] dark:text-white hover:text-[#0F172A] dark:hover:text-[#C89128]'
                }`}
              >
                For Service Providers
              </button>
            </div>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-[#0F172A] dark:text-white mb-4">
              {activeTab === 'owners' ? 'Maximize Your Property Value' : 'Grow Your Business'}
            </h2>
            <p className="text-[#64748B] dark:text-white/60 max-w-xl mx-auto mb-6">
              {activeTab === 'owners'
                ? 'Professional management services to maximize your rental income and minimize your workload'
                : 'Connect with property owners and grow your service business with reliable payments'}
            </p>
            <ShimmerButton
              onClick={() => handleSignIn(activeTab)}
              variant="primary"
              className="py-3 px-6"
            >
              Get Started as {activeTab === 'owners' ? 'Owner' : 'Provider'}
            </ShimmerButton>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-[#0F172A] dark:text-white mb-4">
              Our <span className="text-gradient">Services</span>
            </h2>
            <p className="text-[#64748B] dark:text-white/60">
              Comprehensive solutions for modern property management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                description={service.description}
                features={service.features}
                delay={index * 0.15}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#1E3A5F] to-[#0F172A]" />
        
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C89128]/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of property owners and service providers across Tanzania
            </p>
            <ShimmerButton
              onClick={() => handleSignIn('user')}
              variant="primary"
            >
              Start Your Journey <ArrowRight className="w-5 h-5" />
            </ShimmerButton>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-[#0F172A]/80 border-t border-[#DDE1E8]/50 dark:border-[#1E3A5F]/50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-[#64748B] dark:text-white/60">
            © 2026 Oweru. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}