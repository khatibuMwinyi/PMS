import { Button } from '@/components/ui/Button';
import { FINAL_CTA } from '@/lib/landingContent';

export function FinalCta() {
  return (
    <section className="bg-accent py-20 md:py-28">
      <div className="mx-auto max-w-editorial px-6 text-center">
        <h2 className="font-serif text-h1 text-primary mb-4">{FINAL_CTA.headline}</h2>
        <p className="text-body-lg text-primary/80 mb-8 max-w-lg mx-auto">{FINAL_CTA.body}</p>
        <Button as="a" href={FINAL_CTA.cta.href} variant="primary" size="lg">
          {FINAL_CTA.cta.label}
        </Button>
      </div>
    </section>
  );
}
