import { prisma } from '@/core/database/client';

/**
 * FAQs for the marketing page.
 * Returns an array of question/answer pairs.
 */
export async function getFaqs() {
  // Placeholder static data – replace with real DB table when available.
  return [
    { id: '1', question: 'What is Oweru?', answer: 'A property‑management platform connecting owners with vetted service providers.' },
    { id: '2', question: 'How are providers vetted?', answer: 'Through background checks, performance reviews, and on‑board training.' },
    { id: '3', question: 'What payment methods are supported?', answer: 'Mobile Money (M-Pesa, Tigo Pesa), credit cards, and bank transfers.' },
  ];
}

/**
 * Pricing tiers for different service levels.
 */
export async function getPricingTiers() {
  // Static placeholder – could be stored in a pricing table.
  return [
    { tier: 'Basic', price: 'TSh 5,000', description: 'Standard service booking' },
    { tier: 'Premium', price: 'TSh 9,000', description: 'Priority scheduling + warranty' },
    { tier: 'Enterprise', price: 'Contact us', description: 'Custom packages for large property portfolios' },
  ];
}

/**
 * Customer testimonials – reused from landing but could be filtered.
 */
export async function getTestimonials(limit = 4) {
  // Reuse the same placeholder data as landing for now.
  return Array.from({ length: limit }, (_, i) => ({
    id: `t-${i + 1}`,
    author: `Customer ${i + 1}`,
    quote: 'Excellent service, highly recommended!',
  }));
}

/**
 * Case‑study snippets – placeholder static content.
 */
export async function getCaseStudies(limit = 2) {
  return Array.from({ length: limit }, (_, i) => ({
    id: `cs-${i + 1}`,
    title: `Case Study ${i + 1}`,
    summary: 'How Oweru helped a landlord increase occupancy by 20% in 3 months.',
    url: `/case-study/${i + 1}`,
  }));
}
