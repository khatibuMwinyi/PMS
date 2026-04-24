'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  featured: boolean;
  placeholder: boolean;
  features: string[];
  cta: string;
}

interface PricingGridProps {
  monthly?: boolean;
  onPlanSelect?: (planId: string) => void;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individual property owners',
    price: {
      monthly: 9,
      yearly: 90,
    },
    featured: false,
    placeholder: true,
    features: [
      'Up to 5 properties',
      'Basic tenant management',
      'Maintenance tracking',
      'Monthly reports',
      'Email support'
    ],
    cta: 'Get Started'
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professional property managers',
    price: {
      monthly: 29,
      yearly: 290,
    },
    featured: true,
    placeholder: true,
    features: [
      'Up to 25 properties',
      'Advanced tenant management',
      'Maintenance workflow',
      'Weekly reports',
      'Priority support',
      'Financial analytics',
      'Document storage'
    ],
    cta: 'Try Pro Free'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large property management companies',
    price: {
      monthly: 99,
      yearly: 990,
    },
    featured: false,
    placeholder: true,
    features: [
      'Unlimited properties',
      'Custom tenant management',
      'Advanced workflows',
      'Real-time analytics',
      '24/7 phone support',
      'Custom integrations',
      'White-label options',
      'Dedicated account manager'
    ],
    cta: 'Contact Sales'
  }
];

export default function PricingGrid({ monthly = true, onPlanSelect }: PricingGridProps) {
  const router = useRouter();
  const [isMonthly, setIsMonthly] = useState(monthly);
  const prefersReducedMotion = typeof window !== 'undefined' ?
    window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  const handlePlanSelect = (planId: string) => {
    if (onPlanSelect) {
      onPlanSelect(planId);
    } else {
      router.push(`/register?plan=${planId}`);
    }
  };

  return (
    <div className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.1 : 0.6,
              delay: 0.1
            }}
            className="text-4xl font-bold text-[var(--text-primary)] mb-4"
          >
            Choose Your Plan
          </motion.h2>
          <p className="text-xl text-[var(--text-secondary)]">
            Select the perfect plan for your property management needs
          </p>
        </div>

        {/* Monthly/Yearly Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-[var(--surface-card)] rounded-full p-1 shadow-sm">
            <button
              onClick={() => setIsMonthly(true)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                isMonthly
                  ? 'bg-[var(--brand-primary)] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              aria-pressed={isMonthly}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsMonthly(false)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                !isMonthly
                  ? 'bg-[var(--brand-primary)] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              aria-pressed={!isMonthly}
            >
              Yearly <span className="text-xs font-bold ml-1">-17%</span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0.1 : 0.6,
                delay: 0.1 * index
              }}
              className={`relative ${
                tier.featured
                  ? 'border-[var(--brand-gold)] shadow-lg'
                  : 'border-[var(--border-default)]'
              } bg-[var(--surface-card)] rounded-2xl p-8 ${
                tier.featured ? 'ring-2 ring-[var(--brand-gold)]/20' : ''
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[var(--brand-gold)] text-[var(--brand-primary)] px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center pt-6">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  {tier.name}
                </h3>
                <p className="text-[var(--text-secondary)] mb-6">
                  {tier.description}
                </p>

                <div className="mb-8">
                  <div className="text-4xl font-bold text-[var(--text-primary)] mb-2">
                    ${isMonthly ? tier.price.monthly : tier.price.yearly}
                    <span className="text-base font-normal text-[var(--text-secondary)]">
                      /{isMonthly ? 'mo' : 'yr'}
                    </span>
                    {tier.placeholder && (
                      <span className="ml-2 text-xs text-[var(--text-muted)] italic">
                        placeholder
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {isMonthly ? 'Billed monthly' : 'Billed yearly'}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[var(--brand-gold)] mt-0.5 flex-shrink-0" />
                      <span className="text-[var(--text-secondary)]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(tier.id)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    tier.featured
                      ? 'bg-[var(--brand-gold)] text-[var(--brand-primary)] hover:bg-[var(--brand-gold-light)] shadow-md hover:shadow-lg'
                      : 'bg-[var(--surface-overlay)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                  }`}
                  aria-label={`Select ${tier.name} plan`}
                >
                  {tier.cta}
                </button>

                {tier.placeholder && (
                  <p className="text-xs text-[var(--text-muted)] mt-4 italic">
                    Placeholder pricing - may vary
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Placeholder Notice */}
        <div className="text-center mt-12">
          <p className="text-sm text-[var(--text-muted)]">
            <strong>Placeholder pricing:</strong> These rates are for demonstration purposes.
            Actual pricing may vary based on your specific requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
