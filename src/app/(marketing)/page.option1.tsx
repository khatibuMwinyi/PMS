'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, Users, Building2, Shield } from 'lucide-react';

export default function MarketingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Premium Properties",
      description: "Curated selection of high-quality properties across Tanzania"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Verified Providers",
      description: "Background-checked service professionals for quality assurance"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Transactions",
      description: "Financial security with escrow and payment protection"
    }
  ];

  const testimonials = [
    {
      quote: "Oweru transformed our property management. Professional, reliable, and exceptional service.",
      author: "Sarah Johnson",
      role: "Property Owner, Dar es Salaam"
    },
    {
      quote: "As a service provider, Oweru connects us with quality clients and handles payments seamlessly.",
      author: "Michael Chen",
      role: "Cleaning Service Provider"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F8F9] to-[#DDE1E8]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#2D3A58] to-[#0F172A] opacity-5"></div>
        <div className="relative container mx-auto px-6 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#C89128] text-[#0F172A] rounded-full text-sm font-semibold mb-8"
            >
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute h-2 w-2 rounded-full bg-[#C89128] opacity-75"></span>
                <span className="relative h-2 w-2 rounded-full bg-[#C89128]"></span>
              </span>
              Premium Property Management
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold text-[#0F172A] mb-6 leading-tight">
              Elevated <span className="text-[#C89128]">Property</span> Services
            </h1>
            <p className="text-xl md:text-2xl text-[#2D3A58] mb-12 max-w-2xl mx-auto opacity-90">
              Professional property management across Tanzania. Connecting owners with premium service providers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-[#0F172A] text-white rounded-lg font-semibold text-lg hover:bg-[#1E293B] transition-colors shadow-lg"
              >
                Get Started
                <ArrowRight className="inline ml-2 w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-[#F8F8F9] text-[#0F172A] rounded-lg font-semibold text-lg border-2 border-[#0F172A] hover:bg-[#DDE1E8] transition-colors"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group"
            >
              <div className="text-4xl md:text-5xl font-bold text-[#C89128] mb-2">500+</div>
              <div className="text-lg text-[#2D3A58] font-medium">Properties Managed</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group"
            >
              <div className="text-4xl md:text-5xl font-bold text-[#C89128] mb-2">98%</div>
              <div className="text-lg text-[#2D3A58] font-medium">Client Satisfaction</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="group"
            >
              <div className="text-4xl md:text-5xl font-bold text-[#C89128] mb-2">24/7</div>
              <div className="text-lg text-[#2D3A58] font-medium">Support Available</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#F8F8F9]">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
              Why Choose <span className="text-[#C89128]">Oweru</span>?
            </h2>
            <p className="text-xl text-[#2D3A58] max-w-2xl mx-auto opacity-80">
              We deliver excellence in property management through our comprehensive services
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow group"
              >
                <div className="w-14 h-14 bg-[#C89128] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{feature.title}</h3>
                <p className="text-[#2D3A58] opacity-80">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
              Trusted by <span className="text-[#C89128]">Property Owners</span>
            </h2>
            <p className="text-xl text-[#2D3A58] opacity-80">
              Hear from our satisfied clients across Tanzania
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 * index, duration: 0.6 }}
                className="bg-[#F8F8F9] p-8 rounded-2xl border border-[#DDE1E8] relative"
              >
                <div className="absolute top-0 left-8 transform -translate-y-1/2">
                  <Star className="w-8 h-8 text-[#C89128]" fill="currentColor" />
                </div>
                <blockquote className="text-lg text-[#2D3A58] mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <div className="font-semibold text-[#0F172A]">{testimonial.author}</div>
                  <div className="text-sm text-[#64748B]">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0F172A] to-[#2D3A58] text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to elevate your property management?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join hundreds of property owners and service providers who trust Oweru
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[#C89128] text-[#0F172A] rounded-lg font-semibold text-lg hover:bg-[#E5B972] transition-colors shadow-lg"
            >
              Get Started Today
              <ArrowRight className="inline ml-2 w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}