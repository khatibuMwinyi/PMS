'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NAV_LINKS } from '@/lib/landingContent';
import { cn } from '@/lib/cn';

export function LandingNav() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-surface-card/90 backdrop-blur-sm transition-shadow duration-base',
        scrolled ? 'shadow-card border-b border-border-subtle' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto max-w-editorial px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-serif text-h4 text-text-primary">
          <span className="text-accent font-semibold">Oweru</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-body text-text-secondary hover:text-text-primary transition-colors duration-base"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Button as="a" href="/login"    variant="ghost" size="sm">Sign in</Button>
          <Button as="a" href="/register" variant="gold"  size="sm">Get started</Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-text-secondary hover:text-text-primary"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-border-subtle bg-surface-card px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-body text-text-secondary"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
            <Button as="a" href="/login"    variant="ghost" size="sm" fullWidth>Sign in</Button>
            <Button as="a" href="/register" variant="gold"  size="sm" fullWidth>Get started</Button>
          </div>
        </div>
      )}
    </header>
  );
}
