'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Search, Bell, Sparkles, BookOpen, Layers } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Studio Overview', subtitle: 'GIMA creative intelligence & campaign management' },
  '/create': { title: 'Create Creative', subtitle: 'Generate promotional campaigns from GIMA knowledge' },
  '/projects': { title: 'Project Workspace', subtitle: 'Archived and active marketing creative campaigns' },
  '/knowledge': { title: 'GIMA Knowledge Foundation', subtitle: 'Authoritative curriculum, Free-Course PDFs & site sources' },
  '/assets': { title: 'Creative Asset Library', subtitle: 'Discovered logos, instructors & course imagery' },
  '/activity': { title: 'Operational Log', subtitle: 'Real-time pipeline & content indexing events' },
  '/settings': { title: 'Studio Settings', subtitle: 'Image generation providers and administrative options' },
};

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const pathname = usePathname();
  const current = pageTitles[pathname] || { title: 'GIMA AI Studio', subtitle: 'Admin Marketing Workspace' };
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gima-slate-border bg-white/95 px-4 lg:px-8 backdrop-blur-md">
      {/* Left: Mobile hamburger & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gima-navy">
              GIMA STUDIO
            </span>
            <span className="text-slate-300">/</span>
            <h1 className="text-sm lg:text-base font-bold text-slate-900 tracking-tight">
              {current.title}
            </h1>
          </div>
          <p className="hidden md:block text-[11px] text-slate-500">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick actions & status */}
      <div className="flex items-center gap-3">
        {/* Knowledge quick pill */}
        <Link
          href="/knowledge"
          className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5 text-gima-navy" />
          <span>39 Clinical Sources Indexed</span>
        </Link>

        {/* Primary Create CTA on Header for rapid access */}
        {pathname !== '/create' && (
          <Link
            href="/create"
            className="flex items-center gap-1.5 rounded-lg bg-gima-navy px-3.5 py-1.5 text-xs font-semibold text-white shadow-subtle hover:bg-gima-navy-light transition-all active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5 text-gima-gold-light" />
            <span className="hidden sm:inline">New Creative</span>
            <span className="sm:hidden">Create</span>
          </Link>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="System notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-elevated z-50 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-semibold text-slate-800">System Pipeline Status</span>
                <span className="text-[10px] text-emerald-600 font-medium">Operational</span>
              </div>
              <div className="mt-2 space-y-2 text-xs text-slate-600">
                <div className="rounded bg-slate-50 p-2">
                  <p className="font-medium text-slate-800">Free Course PDFs Verified</p>
                  <p className="text-[11px] text-slate-500">12 PDFs extracted from Theories of Aging.</p>
                </div>
                <div className="rounded bg-slate-50 p-2">
                  <p className="font-medium text-slate-800">Image Generation Mode</p>
                  <p className="text-[11px] text-slate-500">Deterministic Preview active. Architecture ready for Phase 2.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
