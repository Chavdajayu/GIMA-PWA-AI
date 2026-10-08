'use client';

import React, { useState } from 'react';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { PwaRegister } from '@/components/PwaRegister';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>GIMA AI STUDIO — Creative Intelligence for GIMA</title>
        <meta
          name="description"
          content="Internal creative intelligence platform for generating GIMA promotional content, posters, and campaigns from authoritative clinical knowledge."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#1e3a5f" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen bg-gima-cream text-slate-900 antialiased font-sans">
        <div className="flex min-h-screen">
          {/* Left Navigation Sidebar */}
          <Sidebar
            mobileOpen={mobileMenuOpen}
            onMobileClose={() => setMobileMenuOpen(false)}
          />

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col transition-all duration-300 lg:pl-64">
            <Header onMobileMenuToggle={() => setMobileMenuOpen(true)} />
            <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>

        {/* PWA offline shell & installation handler */}
        <PwaRegister />
      </body>
    </html>
  );
}
