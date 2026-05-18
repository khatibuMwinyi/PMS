import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ProviderDashboardData } from '../../schemas/provider-dashboard.schema';

export function TodayProgressTimeline({ steps }: { steps: ProviderDashboardData['todayProgress'] }) {
  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-4">
      <h3 className="text-h2 font-semibold text-[var(--text-primary)] mb-4">Today's Progress</h3>
      <div className="relative pl-2">
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-[var(--border-subtle)]" />
        {steps.map((s, i) => (
          <div key={s.key} className={cn('relative flex items-start gap-4', i < steps.length - 1 && 'mb-4')}>
            <div
              className={cn(
                'w-6 h-6 rounded-full z-10 mt-0.5 flex items-center justify-center',
                s.state === 'completed' && 'bg-[var(--surface-card)] border border-[var(--brand-primary)]',
                s.state === 'active' && 'bg-[var(--brand-primary)] shadow-[0_0_0_4px_rgba(20,27,46,0.1)]',
                s.state === 'pending' && 'bg-[var(--surface-card)] border border-[var(--border-subtle)]',
              )}
            >
              {s.state === 'completed' && <Check size={12} className="text-[var(--brand-primary)]" />}
              {s.state === 'active' && <div className="w-2 h-2 rounded-full bg-[var(--surface-card)]" />}
            </div>
            <div>
              <div
                className={cn(
                  'text-label',
                  s.state === 'pending' ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)] font-bold',
                )}
              >
                {s.label}
              </div>
              <div className="text-body-sm text-[var(--text-secondary)]">{s.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
