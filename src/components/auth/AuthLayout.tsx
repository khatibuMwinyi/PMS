import { ReactNode } from 'react';
import { AnimatedBackground } from './AnimatedBackground';
import { GlowOrb } from './GlowOrb';
import { AuthBrandingPanel } from './AuthBrandingPanel';

interface AuthLayoutProps {
  children: ReactNode;
  branding?: {
    title?: string;
    tagline?: string;
  };
}

export function AuthLayout({ children, branding }: AuthLayoutProps) {
  return (
    <div className="auth-split">
      {/* Left Panel — Branding */}
      <AuthBrandingPanel
        title={branding?.title}
        tagline={branding?.tagline}
      />

      {/* Right Panel — Form */}
      <div className="auth-panel-right">
        {/* Animated Background */}
        <AnimatedBackground />

        {/* Floating Glow Orbs */}
        <GlowOrb
          className="absolute top-20 left-10 w-64 h-64 bg-[#C89128]/20 blur-3xl"
          delay={0}
        />
        <GlowOrb
          className="absolute bottom-20 right-10 w-80 h-80 bg-[#E5B972]/15 blur-3xl"
          delay={2}
        />
        <GlowOrb
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0F172A]/10 blur-3xl"
          delay={4}
        />

        {/* Form Card */}
        <div className="auth-form-card">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-[#E5B972]/40 text-sm">
          © 2026 Oweru. All rights reserved.
        </p>
      </div>
    </div>
  );
}
