import type { ReactNode } from 'react';
import { PropertyBackdrop } from '@/components/auth/PropertyBackdrop';
import { BrandPanel } from '@/components/auth/BrandPanel';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PropertyBackdrop />
      <div className="auth-split">
        <section className="auth-panel-left">
          <BrandPanel />
        </section>
        <section className="auth-panel-right">
          <div className="w-full max-w-md">{children}</div>
          <p className="mt-6 text-xs text-white/40 text-center">
            © {new Date().getFullYear()} Oweru. All rights reserved.
          </p>
        </section>
      </div>
    </>
  );
}
