'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Building2, Users, Shield, Star, TrendingUp, MapPin, Clock } from 'lucide-react';

export default function MarketingPage() {
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Building2 className="w-12 h-12" />,
      title: "Smart Property Management",
      description: "AI-powered solutions for efficient property operations",
      color: "from-[#0F172A] to-[#2D3A58]"
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Verified Service Network",
      description: "Connect with trusted professionals in your area",
      color: "from-[#C89128] to-[#E5B972]"
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Secure Transactions",
      description: "End-to-end encryption for all financial operations",
      color: "from-[#2D3A58] to-[#0F172A]"
    }
  ];

  const locations = [
    { city: "Dar es Salaam", properties: 250, icon: MapPin },
    { city: "Zanzibar", properties: 120, icon: MapPin },
    { city: "Arusha", properties: 80, icon: MapPin },
    { city: "Mwanza", properties: 50, icon: MapPin }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section with Dynamic Background */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#C89128] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#2D3A58] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#0F172A] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="inline-block mb-8"
            >
              <div className="text-sm font-bold text-[#C89128] tracking-wider uppercase">
                Revolutionary Property Management
              </div>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black text-[#0F172A] mb-6 leading-none">
              Property <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C89128] to-[#E5B972]">Reimagined</span>
            </h1>

            <p className="text-xl md:text-2xl text-[#2D3A58] mb-12 max-w-2xl mx-auto opacity-90">
              The future of property management is here. Smart. Simple. Sophisticated.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "#E5B972",
                  color: "#0F172A"
                }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 text-lg font-bold bg-[#0F172A] text-white rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
                <ArrowRight className="inline ml-3 w-6 h-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 text-lg font-bold border-2 border-[#0F172A] text-[#0F172A] rounded-full hover:bg-[#0F172A] hover:text-white transition-all"
              >
                Watch Demo
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-[#0F172A] mb-6">
              Why <span className="text-[#C89128]">Oweru</span>?
            </h2>
            <p className="text-xl text-[#2D3A58] opacity-80">
              We're changing the game in property management
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl p-12 shadow-2xl border border-[#DDE1E8]"
              >
                <div className={`bg-gradient-to-r ${features[currentFeature].color} w-20 h-20 rounded-2xl flex items-center justify-center mb-8`}>
                  <div className="text-white">
                    {features[currentFeature].icon}
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-[#0F172A] mb-4">
                  {features[currentFeature].title}
                </h3>
                <p className="text-lg text-[#2D3A58] opacity-80">
                  {features[currentFeature].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Feature Indicators */}
            <div className="flex justify-center gap-4 mt-12">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentFeature === index
                      ? 'bg-[#C89128] w-8'
                      : 'bg-[#DDE1E8]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-20 bg-[#F8F8F9]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              whileHover={{ y: -10 }}
              className="text-center group cursor-pointer"
            >
              <div className="text-5xl font-bold text-[#C89128] mb-2">500+</div>
              <div className="text-[#2D3A58] font-medium">Properties</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -10 }}
              className="text-center group cursor-pointer"
            >
              <div className="text-5xl font-bold text-[#C89128] mb-2">200+</div>
              <div className="text-[#2D3A58] font-medium">Providers</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -10 }}
              className="text-center group cursor-pointer"
            >
              <div className="text-5xl font-bold text-[#C89128] mb-2">98%</div>
              <div className="text-[#2D3A58] font-medium">Satisfaction</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -10 }}
              className="text-center group cursor-pointer"
            >
              <div className="text-5xl font-bold text-[#C89128] mb-2">24/7</div>
              <div className="text-[#2D3A58] font-medium">Support</div>
            </motion.div>
          </div>

          {/* Locations */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold text-[#0F172A] text-center mb-12">
              Operating Across <span className="text-[#C89128]">Tanzania</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {locations.map((location, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "#0F172A",
                    color: "#F8F8F9"
                  }}
                  className="bg-white p-6 rounded-2xl border border-[#DDE1E8] text-center cursor-pointer transition-all"
                >
                  <location.icon className="w-8 h-8 mx-auto mb-3 text-[#C89128]" />
                  <h4 className="text-xl font-bold text-[#0F172A] mb-2">{location.city}</h4>
                  <p className="text-[#2D3A58] opacity-80">{location.properties} properties</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#2D3A58] to-[#0F172A] opacity-5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-[#0F172A] mb-6">
              Loved by <span className="text-[#C89128]">Tanzanians</span>
            </h2>
            <p className="text-xl text-[#2D3A58] opacity-80">
              Real feedback from our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-xl border border-[#DDE1E8] relative group"
              >
                <div className="absolute top-6 right-6">
                  <Star className="w-6 h-6 text-[#C89128] fill-current" />
                </div>
                <blockquote className="text-lg text-[#2D3A58] mb-6 leading-relaxed">
                  "Oweru has completely transformed how I manage my properties. The platform is intuitive, and the service is exceptional. Highly recommended!"
                </blockquote>
                <div>
                  <div className="font-bold text-[#0F172A]">John M.</div>
                  <div className="text-sm text-[#64748B]">Property Investor, Dar es Salaam</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-[#0F172A] via-[#2D3A58] to-[#0F172A] text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl font-black mb-6">
              Ready to transform?
            </h2>
            <p className="text-2xl mb-12 opacity-90 max-w-2xl mx-auto">
              Join the revolution in property management
            </p>
            <motion.button
              whileHover={{
                scale: 1.1,
                backgroundColor: "#E5B972",
                color: "#0F172A"
              }}
              whileTap={{ scale: 0.95 }}
              className="px-16 py-6 text-2xl font-bold rounded-full shadow-2xl"
            >
              Get Started Now
              <ArrowRight className="inline ml-4 w-8 h-8" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}