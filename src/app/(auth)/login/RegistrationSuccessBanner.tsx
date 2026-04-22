'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export function RegistrationSuccessBanner() {
  const params = useSearchParams();

  if (params.get('registered') !== 'true') return null;

  return (
    <div
      className="flex items-start gap-3 mb-6 px-4 py-3 rounded-[var(--radius-md)] border"
      style={{
        background: 'var(--state-success-bg)',
        borderColor: 'rgba(22, 163, 74, 0.3)',
      }}
    >
      <CheckCircle2
        size={16}
        className="mt-0.5 shrink-0"
        style={{ color: 'var(--state-success)' }}
      />
      <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
        Account created successfully! Please sign in to continue.
      </p>
    </div>
  );
}