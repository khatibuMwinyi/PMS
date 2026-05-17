import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Oweru — Tanzania\'s Managed Property Services',
  description:
    'One contract, one invoice, zero coordination. Oweru manages cleaning, plumbing, electrical, landscaping, security, and pool services for property owners in Tanzania.',
  keywords: ['property management', 'Tanzania', 'Dar es Salaam', 'property services', 'Oweru'],
  openGraph: {
    title: 'Oweru — Tanzania\'s Managed Property Services',
    description: 'One contract, one invoice, zero coordination.',
    type: 'website',
    locale: 'en_TZ',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`} data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        <SessionProvider>
          <ErrorBoundary>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ErrorBoundary>
        </SessionProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}