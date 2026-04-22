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

        {/* Floating Glow Orbs (Light Theme) */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          <GlowOrb
            className="absolute top-20 left-10 w-64 h-64 blur-3xl"
            style={{ backgroundColor: 'rgba(200, 145, 40, 0.1)' }}
            delay={0}
          />
          <GlowOrb
            className="absolute bottom-20 right-10 w-80 h-80 blur-3xl"
            style={{ backgroundColor: 'rgba(200, 145, 40, 0.08)' }}
            delay={2}
          />
          <GlowOrb
            className="absolute top-1/2 left-1/2 w-96 h-96 blur-3xl"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.05)', transform: 'translate(-50%, -50%)' }}
            delay={4}
          />
        </div>

        {/* Form Card */}
        <div className="auth-form-card mx-auto max-w-[420px]" style={{ position: 'relative', zIndex: 10 }}>
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-[var(--text-muted)] text-sm" style={{ position: 'relative', zIndex: 10 }}>
          © 2026 Oweru. All rights reserved.
        </p>
      </div>
    </div>
  );
}
