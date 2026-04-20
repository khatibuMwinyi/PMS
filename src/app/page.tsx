import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--surface-dark)' }}>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 border-b"
        style={{
          background:   'var(--surface-dark)',
          borderColor:  'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <span className="font-display text-[22px] text-[var(--brand-primary)]">Oweru</span>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-[14px] font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--text-on-dark)', opacity: 0.7 }}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center h-9 px-4 rounded-pill text-[14px] font-medium transition-all hover:brightness-110"
            style={{ background: 'var(--brand-primary)', color: 'white' }}
          >
            Get Started →
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 py-24 md:py-36"
        style={{ minHeight: 'calc(100vh - 64px)' }}
      >
        {/* Radial glow behind headline */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 40%, rgba(29,158,117,0.12) 0%, transparent 70%)',
          }}
        />

        <p
          className="relative text-[12px] font-medium tracking-[0.12em] uppercase mb-5"
          style={{ color: 'var(--brand-primary)' }}
        >
          Tanzania&apos;s Property Management Platform
        </p>

        <h1
          className="relative font-display leading-tight mb-6 max-w-3xl"
          style={{
            fontSize:     'clamp(36px, 5.5vw, 60px)',
            color:        'var(--text-on-dark)',
            letterSpacing: '-0.02em',
          }}
        >
          Your Properties,<br />Professionally Managed.
        </h1>

        <p
          className="relative text-[16px] leading-relaxed mb-10 max-w-xl"
          style={{ color: 'var(--text-on-dark)', opacity: 0.65 }}
        >
          Oweru connects property owners with vetted service providers — handling
          everything from scheduling to payment, so you don&apos;t have to.
        </p>

        {/* CTAs */}
        <div className="relative flex flex-col sm:flex-row items-center gap-3 mb-14">
          <Link
            href="/register"
            className="inline-flex items-center h-12 px-8 rounded-pill text-[15px] font-medium transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: 'var(--brand-primary)', color: 'white' }}
          >
            Register as Owner
          </Link>
          <Link
            href="/register?role=provider"
            className="inline-flex items-center h-12 px-8 rounded-pill text-[15px] font-medium border transition-all hover:bg-white/5"
            style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--text-on-dark)' }}
          >
            I&apos;m a Provider →
          </Link>
        </div>

        {/* Trust badges */}
        <div className="relative flex flex-wrap items-center justify-center gap-6">
          {[
            '✓  Vetted Providers',
            '✓  Price-Locked Quotes',
            '✓  Mobile Money Payouts',
          ].map((badge) => (
            <span
              key={badge}
              className="text-[13px] font-medium"
              style={{ color: 'var(--text-on-dark)', opacity: 0.55 }}
            >
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section
        className="px-6 md:px-12 py-20"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <h2
          className="font-display text-center mb-12"
          style={{
            fontSize: 'clamp(28px, 3.5vw, 40px)',
            color:    'var(--text-on-dark)',
            letterSpacing: '-0.01em',
          }}
        >
          How Oweru Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              num:  '01',
              title:'Owner books a service',
              body: 'Get an instant, price-locked quote. No negotiation, no surprises — just clear pricing upfront.',
            },
            {
              num:  '02',
              title:'Oweru orchestrates',
              body: 'We match your job to the highest-rated nearby provider and handle all scheduling and coordination.',
            },
            {
              num:  '03',
              title:'Provider delivers',
              body: 'The provider completes the work, uploads photo evidence, and gets paid 80% directly to their wallet.',
            },
          ].map(({ num, title, body }) => (
            <div
              key={num}
              className="relative rounded-[var(--radius-lg)] p-6 border"
              style={{
                background:  'var(--surface-dark-card)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <p
                className="font-display text-[52px] leading-none mb-4 select-none"
                style={{ color: 'var(--brand-primary)', opacity: 0.18 }}
              >
                {num}
              </p>
              <h3
                className="text-[16px] font-semibold mb-2"
                style={{ color: 'var(--text-on-dark)' }}
              >
                {title}
              </h3>
              <p
                className="text-[14px] leading-relaxed"
                style={{ color: 'var(--text-on-dark)', opacity: 0.55 }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ─────────────────────────────────────── */}
      <section
        className="px-6 md:px-12 py-20 text-center"
        style={{ background: 'var(--brand-primary)' }}
      >
        <h2
          className="font-display mb-4"
          style={{
            fontSize: 'clamp(28px, 3.5vw, 40px)',
            color:    'white',
            letterSpacing: '-0.01em',
          }}
        >
          Ready to stop managing and start owning?
        </h2>
        <p className="text-[16px] mb-8" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Join property owners across Tanzania who trust Oweru.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center h-12 px-8 rounded-pill text-[15px] font-medium transition-all hover:brightness-95 active:scale-[0.98]"
          style={{ background: 'white', color: 'var(--brand-primary-dim)' }}
        >
          Create Your Account →
        </Link>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer
        className="px-6 md:px-12 py-8 flex items-center justify-between text-[13px] border-t"
        style={{
          background:  'var(--surface-dark)',
          borderColor: 'rgba(255,255,255,0.06)',
          color:       'var(--text-muted)',
        }}
      >
        <span className="font-display text-[18px] text-[var(--brand-primary)]">Oweru</span>
        <span>© {new Date().getFullYear()} Oweru Ltd · Tanzania</span>
      </footer>

    </main>
  );
}