'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Building2, Mail, Phone, MapPin, Share2 } from 'lucide-react';

const footerSections = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#' },
      { name: 'Pricing', href: '#' },
      { name: 'Integrations', href: '#' },
      { name: 'API', href: '#' },
      { name: 'Security', href: '#' }
    ]
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Press', href: '#' },
      { name: 'Contact', href: '#' }
    ]
  },
  {
    title: 'Support',
    links: [
      { name: 'Help Center', href: '#' },
      { name: 'Documentation', href: '#' },
      { name: 'Community', href: '#' },
      { name: 'Status', href: '#' },
      { name: 'Professional Services', href: '#' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'GDPR', href: '#' },
      { name: 'Accessibility', href: '#' }
    ]
  }
];

const socialLinks = [
  { name: 'Social', icon: Share2, href: '#' }
];

export default function Footer() {
  const prefersReducedMotion = typeof window !== 'undefined' ?
    window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--brand-primary)] text-[var(--text-on-dark)]">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.1 : 0.6,
              delay: 0.1
            }}
            className="lg:col-span-2"
          >
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Image
                src="/oweru/logo.jpeg"
                alt="Oweru Logo"
                width={120}
                height={40}
              />
            </Link>
            <p className="text-[var(--text-on-dark)]/80 mb-6 max-w-sm">
              The smart way to manage properties and connect with service providers across Tanzania.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-[var(--surface-dark)]/50 flex items-center justify-center hover:bg-[var(--brand-gold)] transition-colors"
                  aria-label={`Follow us on ${social.name}`}
                >
                  <social.icon className="w-5 h-5 text-[var(--text-on-dark)]" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Footer sections */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0.1 : 0.6,
                delay: 0.1 * (index + 1)
              }}
            >
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[var(--text-on-dark)]/70 hover:text-[var(--brand-gold)] transition-colors"
                      aria-label={link.name}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0.1 : 0.6,
            delay: 0.1 * footerSections.length + 1
          }}
          className="border-t border-[var(--surface-dark)]/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-sm text-[var(--text-on-dark)]/70">
            © {currentYear} Oweru. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-[var(--text-on-dark)]/70">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Dar es Salaam, Tanzania</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>+255 22 123 4567</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>info@oweru.co.tz</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}