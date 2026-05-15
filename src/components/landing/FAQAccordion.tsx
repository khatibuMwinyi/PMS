'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ } from '@/lib/landingContent';
import { cn } from '@/lib/cn';

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-surface-page py-20 md:py-28">
      <div className="mx-auto max-w-editorial px-6">
        <div className="text-center mb-14">
          <p className="text-caption uppercase text-text-muted tracking-widest mb-3">Questions</p>
          <h2 className="font-serif text-h1 text-text-primary">Common questions.</h2>
        </div>

        <div className="max-w-2xl mx-auto divide-y divide-border-subtle">
          {FAQ.map((item, i) => (
            <div key={i}>
              <button
                type="button"
                className="w-full flex items-center justify-between py-5 text-left"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-h4 text-text-primary pr-4">{item.q}</span>
                <ChevronDown
                  size={18}
                  className={cn('shrink-0 text-text-muted transition-transform duration-base', open === i && 'rotate-180')}
                />
              </button>
              {open === i && (
                <p className="pb-5 text-body text-text-secondary">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
