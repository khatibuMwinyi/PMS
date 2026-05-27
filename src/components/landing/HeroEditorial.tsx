import Image from 'next/image';
import { Lock, ShieldCheck, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HERO } from '@/lib/landingContent';
import { cn } from '@/lib/cn';

const PILL_ICONS = { Lock, ShieldCheck, Smartphone } as const;

const STATS = [
  { value: '200+', label: 'Verified providers' },
  { value: '48h',  label: 'Dispute resolution' },
  { value: '500+', label: 'Properties managed'  },
  { value: '24h',  label: 'Price lock guarantee'},
] as const;

export function HeroEditorial() {
  return (
    <section data-nav-theme="dark" className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28">
      {/* Full-section background image */}
      <div className="absolute inset-0">
        <Image
          src={HERO.imageSrc}
          alt={HERO.imageAlt}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Blue gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/92 via-blue-900/82 to-slate-900/88" />
        {/* Subtle grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

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

          {/* Right: frosted glass stats card */}
          <div className="relative hidden lg:flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-2xl">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-6">
                Why owners choose Oweru
              </p>
              <div className="grid grid-cols-2 gap-6">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-4xl font-bold text-accent mb-1">{stat.value}</p>
                    <p className="text-white/60 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-6 py-4 shadow-lg flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Trusted platform</p>
                <p className="text-white/50 text-xs">Your properties managed with care</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
