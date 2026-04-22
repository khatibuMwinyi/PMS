'use client';

import { Shield, Zap, Home, Building2 } from 'lucide-react';

interface AuthBrandingPanelProps {
  title?: string;
  tagline?: string;
  features?: Array<{
    icon: React.ReactNode;
    label: string;
    description: string;
  }>;
}

const DEFAULT_FEATURES = [
  {
    icon: <Home size={18} className="text-[var(--brand-gold)]" />,
    label: 'Property Management',
    description: 'Professional services for your property, tracked in real-time',
  },
  {
    icon: <Zap size={18} className="text-[var(--brand-gold)]" />,
    label: 'Instant Quotes',
    description: 'Get price estimates within seconds, no back-and-forth',
  },
  {
    icon: <Shield size={18} className="text-[var(--brand-gold)]" />,
    label: 'Secure Payments',
    description: 'Pay safely via mobile money with full protection',
  },
  {
    icon: <Building2 size={18} className="text-[var(--brand-gold)]" />,
    label: 'Provider Ratings',
    description: 'Choose from rated, vetted service professionals',
  },
];

export function AuthBrandingPanel({
  title = 'Oweru',
  tagline = 'Your property, professionally managed',
  features = DEFAULT_FEATURES,
}: AuthBrandingPanelProps) {
  return (
    <div className="auth-panel-left relative flex items-center">
      
      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.02,
          backgroundImage:
            'linear-gradient(rgba(200, 145, 40, 0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(200, 145, 40, 0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ✅ THIS is where max-width belongs */}
      <div className="relative z-10 w-full max-w-md mx-auto space-y-8">
        
        {/* Brand */}
        <div className="flex items-center gap-3 mb-6">
          <div className="auth-brand-logo">
            <span className="text-xl font-bold text-white">O</span>
          </div>
          <span className="text-4xl md:text-5xl font-bold text-[var(--brand-gold)] tracking-tight">
            {title}
          </span>
        </div>

        {/* Tagline */}
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
          {tagline}
        </p>

        {/* Features */}
        <div className="space-y-5">
          {features.map((feature, i) => (
            <div key={i} className="auth-value-prop">
              <div className="auth-value-prop-icon">
                {feature.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--brand-primary)]">
                  {feature.label}
                </p>
                <p className="text-sm text-[var(--text-secondary)] leading-snug">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Decorative orbs */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: 'rgba(200, 145, 40, 0.08)' }} 
      />
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: 'rgba(200, 145, 40, 0.06)' }} 
      />
    </div>
  );
}