'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: string;   // ISO string
  onExpired?: () => void;
}

function getRemainingMs(expiresAt: string): number {
  return Math.max(0, new Date(expiresAt).getTime() - Date.now());
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() => getRemainingMs(expiresAt));

  useEffect(() => {
    const tick = () => {
      const ms = getRemainingMs(expiresAt);
      setRemaining(ms);
      if (ms === 0) {
        clearInterval(id);
        onExpired?.();
      }
    };

    const id = setInterval(tick, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setRemaining(getRemainingMs(expiresAt));
      }
    };

    const handleFocus = () => {
      setRemaining(getRemainingMs(expiresAt));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [expiresAt, onExpired]);

  const expired  = remaining === 0;
  const critical = remaining < 60 * 60 * 1000;         // < 1 hour
  const warning  = remaining < 3 * 60 * 60 * 1000;     // < 3 hours

  const color = expired
    ? 'var(--state-error)'
    : critical
    ? 'var(--state-error)'
    : warning
    ? 'var(--state-warning)'
    : 'var(--state-success)';

  const bg = expired
    ? 'var(--state-error-bg)'
    : critical
    ? 'var(--state-error-bg)'
    : warning
    ? 'var(--state-warning-bg)'
    : 'var(--state-success-bg)';

  return (
    <div
      className="inline-flex items-center gap-1.5 px-[var(--px-2-5)] py-1 rounded-pill text-[var(--text-xs)] font-medium font-mono tabular-nums"
      style={{ background: bg, color }}
      title={expired ? 'Offer expired' : `Offer expires at ${new Date(expiresAt).toLocaleTimeString()}`}
    >
      <Clock size={12} />
      {expired ? 'Expired' : formatDuration(remaining)}
    </div>
  );
}