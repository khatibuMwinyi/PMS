'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NAV_LINKS } from '@/lib/landingContent';
import { cn } from '@/lib/cn';

export function LandingNav() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(false);

  useEffect(() => {
    const checkSection = () => {
      const navHeight = 70;
      const scrollY = window.scrollY + navHeight;
      const sections = document.querySelectorAll('[data-nav-theme]');
      let isOverDark = false;

      for (const section of sections) {
        const el = section as HTMLElement;
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (scrollY >= top && scrollY < bottom) {
          if (el.getAttribute('data-nav-theme') === 'dark') {
            isOverDark = true;
          }
          break;
        }
      }

      setOverDark(isOverDark);
    };

    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      checkSection();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-surface-card/90 backdrop-blur-sm transition-all duration-base',
        scrolled && !overDark && 'shadow-card border-b border-border-subtle',
        overDark && 'border-b border-white/10',
        !scrolled && !overDark && 'border-b border-transparent',
      )}
    >
      <div className="mx-auto max-w-editorial px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 rounded-md overflow-hidden shrink-0">
            <Image
              src="/images/logo.webp"
              alt="Oweru"
              fill
              sizes="28px"
              className="object-contain"
            />
          </div>
          <span className={cn(
            'font-serif text-h4 transition-colors duration-base',
            overDark ? 'text-text-on-dark' : 'text-text-primary',
          )}>
            <span className="text-accent font-semibold">Oweru</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'text-body transition-colors duration-base',
                overDark
                  ? 'text-text-secondary-on-dark hover:text-text-on-dark'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Button as="a" href="/login" variant="ghost" size="sm"
            style={overDark ? { color: 'var(--text-on-dark)' } as React.CSSProperties : undefined}
          >
            Sign in
          </Button>
          <Button as="a" href="/register" variant="gold" size="sm">Get started</Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className={cn(
            'md:hidden p-2 rounded-md transition-colors duration-base',
            overDark
              ? 'text-text-secondary-on-dark hover:text-text-on-dark'
              : 'text-text-secondary hover:text-text-primary',
          )}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className={cn(
          'md:hidden border-t px-6 py-4 flex flex-col gap-4 transition-colors duration-base',
          overDark
            ? 'border-white/10 bg-primary'
            : 'border-border-subtle bg-surface-card',
        )}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'text-body transition-colors duration-base',
                overDark ? 'text-text-secondary-on-dark' : 'text-text-secondary',
              )}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className={cn(
            'flex flex-col gap-2 pt-2 border-t',
            overDark ? 'border-white/10' : 'border-border-subtle',
          )}>
            <Button as="a" href="/login" variant="ghost" size="sm" fullWidth
              style={overDark ? { color: 'var(--text-on-dark)' } as React.CSSProperties : undefined}
            >
              Sign in
            </Button>
            <Button as="a" href="/register" variant="gold" size="sm" fullWidth>Get started</Button>
          </div>
        </div>
      )}
    </header>
  );
}
