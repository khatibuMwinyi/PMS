import Image from 'next/image';
import { Lock, ShieldCheck, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HERO } from '@/lib/landingContent';
import { cn } from '@/lib/cn';

const PILL_ICONS = { Lock, ShieldCheck, Smartphone } as const;

export function HeroEditorial() {
  return (
    <section className="relative overflow-hidden bg-primary pt-24 pb-20 md:pt-32 md:pb-28">
      {/* Subtle grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(var(--text-on-dark) 1px, transparent 1px), linear-gradient(90deg, var(--text-on-dark) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative mx-auto max-w-editorial px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div>
            <p className="text-accent text-caption uppercase tracking-widest mb-4">
              {HERO.eyebrow}
            </p>

            <h1 className="font-serif text-display text-text-on-dark leading-none mb-6">
              {HERO.headline.map((line, i) => (
                <span key={i} className={cn('block', i === 0 && '')}>
                  {i === 1 ? (
                    <>
                      {line.split(HERO.goldWord).map((part, j, arr) => (
                        <span key={j}>
                          {part}
                          {j < arr.length - 1 && (
                            <span className="text-accent">{HERO.goldWord}</span>
                          )}
                        </span>
                      ))}
                    </>
                  ) : line}
                </span>
              ))}
            </h1>

            <p className="text-body-lg text-text-secondary-on-dark max-w-md mb-8">
              {HERO.subhead}
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Button as="a" href={HERO.ctaPrimary.href} variant="gold" size="lg">
                {HERO.ctaPrimary.label}
              </Button>
              <Button
                as="a"
                href={HERO.ctaSecondary.href}
                variant="secondary"
                size="lg"
                className="border-white/20 text-text-on-dark hover:bg-white/10"
              >
                {HERO.ctaSecondary.label}
              </Button>
            </div>

            {/* Proof pills */}
            <div className="flex flex-wrap gap-3">
              {HERO.proofPills.map((pill) => {
                const Icon = PILL_ICONS[pill.icon as keyof typeof PILL_ICONS];
                return (
                  <span
                    key={pill.label}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-white/8 text-text-secondary-on-dark text-body-sm border border-white/10"
                  >
                    {Icon && <Icon size={14} className="text-accent" />}
                    {pill.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Right: hero image */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-xl overflow-hidden aspect-[4/3] shadow-bold">
              <Image
                src={HERO.imageSrc}
                alt={HERO.imageAlt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1280px) 50vw, 600px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
