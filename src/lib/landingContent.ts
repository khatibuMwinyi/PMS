export const NAV_LINKS = [
  { label: 'Services',          href: '#services' },
  { label: 'How it works',      href: '#how-it-works' },
  { label: 'Pricing',           href: '#quote' },
  { label: 'Become a provider', href: '#become-provider' },
];

export const HERO = {
  eyebrow: "Tanzania's managed property service",
  headline: ['Property services,', 'fully managed by Oweru.'],
  goldWord: 'managed',
  subhead: 'One contract. One invoice. One team accountable for every service across every property.',
  ctaPrimary:   { label: 'Get a quote',        href: '/register?intent=quote' },
  ctaSecondary: { label: 'See how it works',   href: '#how-it-works' },
  proofPills: [
    { label: '24-hour price lock',     icon: 'Lock'         as const },
    { label: 'Verified providers only', icon: 'ShieldCheck' as const },
    { label: 'Pay via mobile money',   icon: 'Smartphone'   as const },
  ],
  imageSrc: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1920&q=85',
  imageAlt: 'Luxury residential apartment complex — professional property management',
};

export const STEPS = [
  {
    number: '01',
    title: 'Get an instant quote.',
    body: 'Pick a service and unit count. Pricing is calculated by a rule-based engine and locked for 24 hours.',
    icon: 'FileText' as const,
  },
  {
    number: '02',
    title: 'We assign a verified provider.',
    body: 'Oweru selects the highest-ranked available provider. You never negotiate or coordinate directly.',
    icon: 'UsersRound' as const,
  },
  {
    number: '03',
    title: 'Service delivered. One invoice from Oweru.',
    body: 'Pay Oweru via mobile money. Service is complete before payment is released.',
    icon: 'CircleCheck' as const,
  },
];

export const SERVICE_CATEGORIES = [
  { key: 'cleaning',    name: 'Cleaning',    icon: 'Sparkles'    as const, startsAt: 18000,  unit: 'unit / month',      description: 'Recurring deep clean for residential buildings.' },
  { key: 'plumbing',    name: 'Plumbing',    icon: 'Wrench'      as const, startsAt: 22000,  unit: 'visit',             description: 'Diagnostic, repair, and routine maintenance.' },
  { key: 'electrical',  name: 'Electrical',  icon: 'Zap'         as const, startsAt: 25000,  unit: 'visit',             description: 'Licensed electricians for inspection and repair.' },
  { key: 'landscaping', name: 'Landscaping', icon: 'Trees'       as const, startsAt: 35000,  unit: 'property / visit',  description: 'Lawn, hedges, and exterior grounds maintenance.' },
  { key: 'security',    name: 'Security',    icon: 'ShieldCheck' as const, startsAt: 120000, unit: 'guard / month',     description: 'Vetted overnight or 24-hour security personnel.' },
  { key: 'pool',        name: 'Pool',        icon: 'Waves'       as const, startsAt: 45000,  unit: 'visit',             description: 'Weekly cleaning, chemical balancing, equipment check.' },
];

export const TRUST_STATS = [
  { label: 'Verified providers',     value: '200+',   caption: 'Background-checked, ID-verified' },
  { label: 'Properties managed',     value: '500+',   caption: 'Across Dar es Salaam' },
  { label: 'Services completed',     value: '5,000+', caption: 'And counting' },
  { label: 'Dispute resolution SLA', value: '48h',    caption: 'Average response time' },
];

export const PROVIDER_BAND = {
  eyebrow:   'For service providers',
  headline:  'Work on your terms. Keep your schedule yours.',
  body:      'Oweru sends you verified work orders. You accept the ones that fit. We handle billing, disputes, and owner communication.',
  cta:       { label: 'Apply to join', href: '/register?role=provider' },
  highlight: { number: '200+', caption: 'active providers trust Oweru.' },
};

export const FAQ = [
  {
    q: 'How is pricing calculated and locked?',
    a: 'Prices come from a rule-based engine that factors service type, unit count, frequency, and region. Once a quote is generated, it is locked for 24 hours. Submit within that window and the price is binding.',
  },
  {
    q: 'Can I cancel a service?',
    a: 'Yes. Before a provider has accepted, cancellation is free. After acceptance, a 20% penalty applies (15% compensates the provider, 5% is platform fee).',
  },
  {
    q: 'What happens if a payment fails?',
    a: 'We retry three times. If all fail, the service is paused, you are notified, and the invoice remains open. After seven days unpaid, the service is fully suspended until resolved.',
  },
  {
    q: 'How are providers vetted?',
    a: 'Every provider completes ID + KYC verification, submits service category licenses where applicable, and starts with a baseline performance score. Three strikes within a 30-day window triggers suspension.',
  },
  {
    q: "What if I'm not satisfied with a service?",
    a: 'You have 24 hours to dispute a completed task. Oweru staff reviews evidence within 48 hours. Outcomes range from partial refund to full refund and rework.',
  },
  {
    q: 'Which regions do you cover?',
    a: 'Dar es Salaam is the primary coverage area, with expanding service in Arusha, Mwanza, and Zanzibar. Outside those, we coordinate case-by-case.',
  },
];

export const FINAL_CTA = {
  headline: 'Ready to manage less, own more?',
  body:     'Get your first quote in under a minute. No card required, no contract until you confirm.',
  cta:      { label: 'Get your first quote', href: '/register?intent=quote' },
};

export const FOOTER = {
  company: [
    { label: 'About',        href: '/about' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Careers',      href: '/careers' },
    { label: 'Press',        href: '/press' },
  ],
  services: [
    { label: 'Cleaning',    href: '#services' },
    { label: 'Plumbing',    href: '#services' },
    { label: 'Electrical',  href: '#services' },
    { label: 'Landscaping', href: '#services' },
    { label: 'Security',    href: '#services' },
    { label: 'Pool',        href: '#services' },
  ],
  legal: [
    { label: 'Terms of service', href: '/legal/terms' },
    { label: 'Privacy policy',   href: '/legal/privacy' },
    { label: 'Refund policy',    href: '/legal/refund' },
    { label: 'Cookie policy',    href: '/legal/cookies' },
  ],
  contact: {
    email:                'hello@oweru.co.tz',
    phone:                '+255 700 000 000',
    address:              'Dar es Salaam, Tanzania',
    businessRegistration: 'TZ-REG-PENDING',
  },
};
