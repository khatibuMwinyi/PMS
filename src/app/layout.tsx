import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OPSMP - Phase 3',
  description: 'Oweru Property Service Management Platform Foundation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}