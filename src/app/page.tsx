'use client';

import Hero from '@/components/Hero/Hero';
import PricingGrid from '@/components/Pricing/PricingGrid';
import Footer from '@/components/Footer/Footer';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDevice } from '@/components/hooks/useDevice';
import { Building2, Users, TrendingUp, Clock, X, Menu, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('owners');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const device = useDevice();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isMobile = device === 'mobile' && mounted;

  const handleSignIn = (role: string) => {
    router.push('/login');
  };

  const services = [
    {
      title: "Property Management",
      description: "Comprehensive management solutions for property owners",
      features: ["Rental Collection", "Maintenance Coordination", "Tenant Relations"]
    },
    {
      title: "Service Provider Network",
      description: "Connect with verified service professionals",
      features: ["Background Checks", "Performance Tracking", "Secure Payments"]
    },
    {
      title: "Financial Services",
      description: "Transparent financial management and reporting",
      features: ["Digital Payments", "Expense Tracking", "Revenue Reports"]
    }
  ];

  const stats = [
    { label: "Properties", value: "500+", icon: Building2 },
    { label: "Service Providers", value: "200+", icon: Users },
    { label: "Transactions", value: "10K+", icon: TrendingUp },
    { label: "Response Time", value: "2hrs", icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-[var(--surface-page)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-[#DDE1E8] z-50">
        <div className="container mx-auto px-6 py-4">
          {/* Desktop Navigation */}
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-[#0F172A]"
            >
              <Image
                src="/images/logo.jpeg"
                alt="Oweru Logo"
                width={120}
                height={40}
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
            </motion.div>

            {/* Desktop Links - Hidden on mobile */}
            {!isMobile && (
              <div className="flex items-center gap-8">
                <a href="#" className="text-[#2D3A58] hover:text-[#C89128] transition-colors">Features</a>
                <a href="#" className="text-[#2D3A58] hover:text-[#C89128] transition-colors">Pricing</a>
                <a href="#" className="text-[#2D3A58] hover:text-[#C89128] transition-colors">Contact</a>
                <button
                  onClick={() => handleSignIn('user')}
                  className="px-6 py-2 bg-[#0F172A] text-white rounded-lg font-medium hover:bg-[#1E293B] transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Mobile Hamburger - Hidden on desktop */}
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-[#2D3A58] hover:bg-[#DDE1E8] rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && isMobile && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={[
          'fixed inset-y-0 right-0 z-50 flex flex-col bg-white shadow-xl w-64 transform transition-transform duration-300 ease-in-out',
          mobileMenuOpen && isMobile ? 'translate-x-0' : 'translate-x-full',
          isMobile || !mounted ? '' : 'hidden'
        ].join(' ')}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#DDE1E8]">
          <span className="text-xl font-bold text-[#0F172A]">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-[#2D3A58] hover:bg-[#DDE1E8] rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="flex flex-col gap-4">
            <a href="#" className="text-[#2D3A58] hover:text-[#C89128] transition-colors py-2">Features</a>
            <a href="#" className="text-[#2D3A58] hover:text-[#C89128] transition-colors py-2">Pricing</a>
            <a href="#" className="text-[#2D3A58] hover:text-[#C89128] transition-colors py-2">Contact</a>
          </nav>
        </div>
        <div className="p-4 border-t border-[#DDE1E8]">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleSignIn('user');
            }}
            className="w-full px-6 py-3 bg-[#0F172A] text-white rounded-lg font-medium hover:bg-[#1E293B] transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>

      <Hero
        title="Simplify Property Operations"
        subtitle="The smart way to manage properties and connect with service providers across Tanzania"
        onGetStarted={() => handleSignIn('user')}
      />

      {/* Role Selection Cards */}
      <section className="py-20 bg-[var(--surface-card)]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                role: 'owner',
                title: 'For Property Owners',
                description: 'Maximize your property value with professional management',
                icon: Building2
              },
              {
                role: 'provider',
                title: 'For Service Providers',
                description: 'Grow your business with verified property connections',
                icon: Users
              },
              {
                role: 'admin',
                title: 'For Administrators',
                description: 'Oversee the entire platform operations',
                icon: Shield
              }
            ].map((item, index) => (
              <motion.div
                key={item.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-[var(--surface-card)] p-8 rounded-2xl border border-[var(--border-default)] hover:border-[var(--brand-gold)] hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleSignIn(item.role)}
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-[var(--surface-overlay)] rounded-xl flex items-center justify-center group-hover:bg-[var(--brand-gold)] transition-colors">
                  <item.icon className="w-8 h-8 text-[var(--text-primary)] group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 text-center">{item.title}</h3>
                <p className="text-[var(--text-secondary)] text-center mb-6">{item.description}</p>
                <div className="text-center">
                  <span className="text-sm font-medium text-[var(--brand-gold)]">Sign In →</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-[var(--surface-overlay)] rounded-lg flex items-center justify-center group-hover:bg-[var(--brand-gold)] transition-colors">
                  <stat.icon className="w-6 h-6 text-[var(--text-primary)] group-hover:text-white" />
                </div>
                <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">{stat.value}</div>
                <div className="text-sm text-[var(--text-muted)]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex justify-center mb-12">
            <div className="bg-[#DDE1E8] rounded-full p-1 flex">
              <button
                onClick={() => setActiveTab('owners')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'owners'
                    ? 'bg-[#0F172A] text-white'
                    : 'text-[#2D3A58] hover:text-[#0F172A]'
                }`}
              >
                For Property Owners
              </button>
              <button
                onClick={() => setActiveTab('providers')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'providers'
                    ? 'bg-[#0F172A] text-white'
                    : 'text-[#2D3A58] hover:text-[#0F172A]'
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
            <h2 className="text-3xl font-bold text-[#0F172A] mb-6">
              {activeTab === 'owners' ? 'Maximize Your Property Value' : 'Grow Your Business'}
            </h2>
            <p className="text-lg text-[#2D3A58] opacity-80 max-w-2xl mx-auto">
              {activeTab === 'owners'
                ? 'Professional management services to maximize your rental income and minimize your workload'
                : 'Connect with property owners and grow your service business with Oweru platform'
              }
            </p>
            <button
              onClick={() => handleSignIn(activeTab)}
              className="mt-6 px-6 py-3 bg-[#0F172A] text-white rounded-lg font-medium hover:bg-[#1E293B] transition-colors"
            >
              Get Started as {activeTab === 'owners' ? 'Owner' : 'Provider'}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-[#F8F8F9]">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#0F172A] mb-4">
              Our <span className="text-[#C89128]">Services</span>
            </h2>
            <p className="text-xl text-[#2D3A58] opacity-80">
              Comprehensive solutions for modern property management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                className="bg-white p-8 rounded-2xl border border-[#DDE1E8] hover:border-[#C89128] transition-all"
              >
                <h3 className="text-2xl font-bold text-[#0F172A] mb-4">{service.title}</h3>
                <p className="text-[#2D3A58] mb-6 opacity-80">{service.description}</p>
                <ul className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#C89128] rounded-full"></div>
                      <span className="text-[#2D3A58]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingGrid />

      {/* CTA */}
      <section className="py-20 bg-[var(--brand-primary)] text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join Oweru today and experience professional property management
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSignIn('user')}
              className="px-8 py-4 bg-[var(--brand-gold)] text-[var(--brand-primary)] rounded-lg font-semibold hover:bg-[var(--brand-gold-light)] transition-colors"
            >
              Start Your Journey
              <ArrowRight className="inline ml-2 w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}