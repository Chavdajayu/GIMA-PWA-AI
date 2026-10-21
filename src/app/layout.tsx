import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/AppShell';
import { PwaRegister } from '@/components/PwaRegister';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  fallback: ['Aptos', 'Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'Arial', 'sans-serif'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'GIMA AI STUDIO — Creative Intelligence for GIMA',
  description:
    'Internal creative intelligence platform for generating GIMA promotional content, posters, and campaigns from authoritative clinical knowledge.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#1e3a5f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gima-cream text-slate-900 antialiased font-sans selection:bg-gima-navy/15 selection:text-gima-navy">
        <AppShell>{children}</AppShell>
        {/* PWA offline shell & installation handler */}
        <PwaRegister />
      </body>
    </html>
  );
}
