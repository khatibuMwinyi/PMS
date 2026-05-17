import Link from 'next/link';
import Image from 'next/image';
import { FOOTER } from '@/lib/landingContent';

export function FooterEditorial() {
  const year = new Date().getFullYear();

  return (
    <footer data-nav-theme="dark" className="bg-primary border-t border-white/10 pt-16 pb-10">
      <div className="mx-auto max-w-editorial px-6">
        {/* Top: logo + columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                <Image
                  src="/images/logo.jpeg"
                  alt="Oweru"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <span className="font-serif text-h3 text-accent">Oweru</span>
            </div>
            <p className="text-body-sm text-text-secondary-on-dark max-w-xs">
              Tanzania's managed property service platform. One contract. One invoice.
            </p>
          </div>

          {/* Company */}
          <nav aria-label="Company links">
            <p className="text-caption uppercase text-text-muted-on-dark tracking-widest mb-4">Company</p>
            <ul className="flex flex-col gap-2.5">
              {FOOTER.company.map((l) => (
                <li key={l.href}><Link href={l.href} className="text-body-sm text-text-secondary-on-dark hover:text-text-on-dark transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <nav aria-label="Services links">
            <p className="text-caption uppercase text-text-muted-on-dark tracking-widest mb-4">Services</p>
            <ul className="flex flex-col gap-2.5">
              {FOOTER.services.map((l) => (
                <li key={l.label}><Link href={l.href} className="text-body-sm text-text-secondary-on-dark hover:text-text-on-dark transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <p className="text-caption uppercase text-text-muted-on-dark tracking-widest mb-4">Contact</p>
            <ul className="flex flex-col gap-2.5">
              <li><a href={`mailto:${FOOTER.contact.email}`} className="text-body-sm text-text-secondary-on-dark hover:text-text-on-dark transition-colors">{FOOTER.contact.email}</a></li>
              <li><span className="text-body-sm text-text-secondary-on-dark">{FOOTER.contact.phone}</span></li>
              <li><span className="text-body-sm text-text-secondary-on-dark">{FOOTER.contact.address}</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom: legal */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-body-sm text-text-muted-on-dark">
              © {year} Oweru. Reg: {FOOTER.contact.businessRegistration}
            </p>
          <nav aria-label="Legal links">
            <ul className="flex flex-wrap gap-4">
              {FOOTER.legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-body-sm text-text-muted-on-dark hover:text-text-secondary-on-dark transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
