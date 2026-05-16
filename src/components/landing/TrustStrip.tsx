import { TRUST_STATS } from '@/lib/landingContent';

export function TrustStrip() {
  return (
    <section className="bg-surface-card border-y border-border-subtle py-12">
      <div className="mx-auto max-w-editorial px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-h2 text-text-primary tabular-nums">{stat.value}</p>
              <p className="text-body-sm font-medium text-text-primary mt-1">{stat.label}</p>
              <p className="text-body-sm text-text-muted mt-0.5">{stat.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
