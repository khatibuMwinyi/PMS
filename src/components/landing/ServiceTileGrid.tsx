import { Sparkles, Wrench, Zap, Trees, ShieldCheck, Waves } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SERVICE_CATEGORIES } from '@/lib/landingContent';
import { cn } from '@/lib/cn';

const SERVICE_ICONS = { Sparkles, Wrench, Zap, Trees, ShieldCheck, Waves } as const;

function formatTZS(n: number) {
  return new Intl.NumberFormat('en-TZ', { maximumFractionDigits: 0 }).format(n);
}

export function ServiceTileGrid() {
  return (
    <section id="services" className="bg-surface-page py-20 md:py-28">
      <div className="mx-auto max-w-editorial px-6">
        <div className="text-center mb-14">
          <p className="text-caption uppercase text-text-muted tracking-widest mb-3">What we manage</p>
          <h2 className="font-serif text-h1 text-text-primary">Every service, one contract.</h2>
          <p className="text-body-lg text-text-secondary mt-3 max-w-xl mx-auto">
            All managed by Oweru. You never deal with individual providers directly.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICE_CATEGORIES.map((svc) => {
            const Icon = SERVICE_ICONS[svc.icon as keyof typeof SERVICE_ICONS];
            return (
              <div
                key={svc.key}
                className={cn(
                  'group relative bg-surface-card rounded-xl p-6 border border-border-subtle',
                  'shadow-card hover:-translate-y-1 hover:shadow-bold transition-all duration-base',
                )}
              >
                <div className="w-12 h-12 rounded-card bg-primary/8 flex items-center justify-center mb-4">
                  {Icon && <Icon size={22} className="text-primary" />}
                </div>
                <h3 className="text-h3 text-text-primary mb-1">{svc.name}</h3>
                <p className="text-body-sm text-text-secondary mb-4">{svc.description}</p>
                <p className="text-caption text-text-muted">
                  From <span className="text-text-primary font-medium tabular-nums">TZS {formatTZS(svc.startsAt)}</span>
                  {' '}/ {svc.unit}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Button as="a" href="/register?intent=quote" variant="primary" size="lg">
            Get a quote for your property
          </Button>
        </div>
      </div>
    </section>
  );
}
