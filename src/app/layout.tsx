import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
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
  title: 'Oweru — Property Services, Professionally Managed',
  description: 'Oweru Property Service Management Platform',
  icons: {
    icon: '/images/logo.jpeg',
    apple: '/images/logo.jpeg',
  },
  other: {
    preconnect: 'https://fonts.googleapis.com',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans antialiased">
        <SessionProvider>
          <ErrorBoundary>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ErrorBoundary>
        </SessionProvider>
      </body>
    </html>
  );
}