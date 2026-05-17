import { Button } from '@/components/ui/Button';
import { PROVIDER_BAND } from '@/lib/landingContent';

export function ProviderBand() {
  return (
    <section id="become-provider" data-nav-theme="dark" className="bg-primary py-20 md:py-28">
      <div className="mx-auto max-w-editorial px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-caption uppercase text-accent tracking-widest mb-4">{PROVIDER_BAND.eyebrow}</p>
            <h2 className="font-serif text-h1 text-text-on-dark mb-4">{PROVIDER_BAND.headline}</h2>
            <p className="text-body-lg text-text-secondary-on-dark mb-8 max-w-lg">{PROVIDER_BAND.body}</p>
            <Button as="a" href={PROVIDER_BAND.cta.href} variant="gold" size="lg">
              {PROVIDER_BAND.cta.label}
            </Button>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="bg-surface-card/10 border border-white/10 rounded-xl px-10 py-8 text-center">
              <p className="font-serif text-display text-accent tabular-nums">{PROVIDER_BAND.highlight.number}</p>
              <p className="text-body-lg text-text-secondary-on-dark mt-2 max-w-xs">{PROVIDER_BAND.highlight.caption}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
