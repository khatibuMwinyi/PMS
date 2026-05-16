import { FileText, UsersRound, CircleCheck } from 'lucide-react';
import { STEPS } from '@/lib/landingContent';

const STEP_ICONS = { FileText, UsersRound, CircleCheck } as const;

export function StepRail() {
  return (
    <section id="how-it-works" className="bg-surface-page py-20 md:py-28">
      <div className="mx-auto max-w-editorial px-6">
        <div className="text-center mb-16">
          <p className="text-caption uppercase text-text-muted tracking-widest mb-3">How it works</p>
          <h2 className="font-serif text-h1 text-text-primary">Three steps. Zero friction.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div aria-hidden className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px bg-border-subtle" />

          {STEPS.map((step) => {
            const Icon = STEP_ICONS[step.icon as keyof typeof STEP_ICONS];
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center md:items-start md:text-left">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-card bg-primary flex items-center justify-center shadow-card">
                    {Icon && <Icon size={28} className="text-accent" />}
                  </div>
                  <span className="absolute -top-2 -right-2 font-serif text-caption text-accent font-semibold">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-h3 text-text-primary mb-2">{step.title}</h3>
                <p className="text-body text-text-secondary">{step.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
