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
    <div className="min-h-screen bg-[var(--surface-dark)] grid lg:grid-cols-2 gap-8 py-12 lg:py-20">
      <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-8">
        {/* Left Panel */}
        <AuthBrandingPanel
          title={branding?.title}
          tagline={branding?.tagline}
        />

        {/* Right Panel */}
        <div className="flex flex-col justify-center items-center p-8 overflow-y-auto relative">
          {/* Background */}
          <AnimatedBackground />

          {/* Glow Effects */}
          <div className="absolute inset-0 pointer-events-none z-[2]">
            <GlowOrb
              className="absolute top-20 left-10 w-64 h-64 blur-3xl"
              delay={0}
            />
            <GlowOrb
              className="absolute bottom-20 right-10 w-80 h-80 blur-3xl"
              delay={2}
            />
            <GlowOrb
              className="absolute top-1/2 left-1/2 w-96 h-96 blur-3xl"
              delay={4}
            />
          </div>

          {/* Form */}
          <div className="w-full flex justify-center">
            <div className="auth-form-card w-full max-w-lg relative z-10">
              {children}
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-sm text-[var(--text-muted)] relative z-10">
            © 2026 Oweru. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}