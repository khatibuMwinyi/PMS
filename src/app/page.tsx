'use client';

import { useState, useEffect } from 'react';
import DesignPreview from '@/app/components/DesignPreview';
import { motion } from 'framer-motion';
import { ArrowRight, Palette, Eye } from 'lucide-react';

export default function LandingPage() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <>
      {/* Welcome Screen */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 bg-[#0F172A] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-4xl mx-auto p-8"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="w-20 h-20 bg-[#C89128] rounded-full flex items-center justify-center mx-auto mb-6">
                <Palette className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">
                Oweru Design System
              </h1>
              <p className="text-xl text-[#DDE1E8] mb-8">
                Choose your preferred landing page design
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={() => setShowWelcome(false)}
                className="px-8 py-4 gradient-accent text-white rounded-lg font-semibold text-lg hover:scale-105 transition-all inline-flex items-center gap-2 shadow-bold"
              >
                Explore Designs
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 text-[#DDE1E8]"
            >
              <p className="text-sm">
                Click the design selector panel in the bottom-right corner to switch between different design options
              </p>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#C89128]/10 to-[#0F172A]/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '0s' }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tl from-[#C89128]/10 to-[#0F172A]/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#C89128]/10 to-[#0F172A]/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '4s' }}
        />
      </div>

      {/* Main Landing Content */}
      <div className="min-h-screen bg-[#F8F8F9] flex items-center justify-center relative">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="gradient-text">Oweru</span> Landing Page
            </h1>
            <p className="text-2xl md:text-3xl text-[#2D3A58] mb-8 max-w-2xl mx-auto">
              Transform your <span className="font-bold gradient-text">Property Management</span> with our professional design system
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block"
          >
            <div className="bg-white p-8 rounded-2xl border border-[#DDE1E8] shadow-lg">
              <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">
                Available Design Options:
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-6">
                <div className="p-4 bg-[#F8F8F9] rounded-lg">
                  <h3 className="font-semibold text-[#C89128] mb-2">Luxury Modern</h3>
                  <p className="text-sm text-[#2D3A58]">Elegant with gold accents</p>
                </div>
                <div className="p-4 bg-[#F8F8F9] rounded-lg">
                  <h3 className="font-semibold text-[#C89128] mb-2">Modern Minimalist</h3>
                  <p className="text-sm text-[#2D3A58]">Clean and functional</p>
                </div>
                <div className="p-4 bg-[#F8F8F9] rounded-lg">
                  <h3 className="font-semibold text-[#C89128] mb-2">Bold Contemporary</h3>
                  <p className="text-sm text-[#2D3A58]">Dynamic and vibrant</p>
                </div>
              </div>
              <p className="text-sm text-[#64748B]">
                Click the <Eye className="inline w-4 h-4 align-middle" /> icon in the bottom-right corner to preview designs
              </p>
            </div>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -10 }}
              className="text-center bg-white p-6 rounded-2xl shadow-bold border border-[#DDE1E8]"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 gradient-primary p-1">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <Palette className="w-8 h-8 text-[#0F172A]" />
                </div>
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-2">Brand Colors</h3>
              <p className="text-sm text-[#2D3A58] opacity-80">Professional palette reflecting Oweru's identity</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -10 }}
              className="text-center bg-white p-6 rounded-2xl shadow-bold border border-[#DDE1E8]"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 gradient-accent p-1">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <ArrowRight className="w-8 h-8 text-[#C89128]" />
                </div>
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-2">Smooth Animations</h3>
              <p className="text-sm text-[#2D3A58] opacity-80">Engaging micro-interactions and transitions</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -10 }}
              className="text-center bg-white p-6 rounded-2xl shadow-bold border border-[#DDE1E8]"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-r from-[#DDE1E8] to-[#F8F8F9] p-1">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <Eye className="w-8 h-8 text-[#0F172A]" />
                </div>
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-2">Live Preview</h3>
              <p className="text-sm text[#2D3A58] opacity-80">Switch designs instantly with our preview system</p>
            </motion.div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <button className="px-8 py-4 gradient-text text-white rounded-lg font-semibold text-lg hover:scale-105 transition-all inline-flex items-center gap-2 shadow-bold">
              Get Started Today
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Design Preview Component */}
      <DesignPreview />
    </>
  );
}