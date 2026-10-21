'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Bell, Sparkles, BookOpen, CheckCircle2, ShieldCheck } from 'lucide-react';
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
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left: Mobile hamburger & breadcrumb */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onMobileMenuToggle}
          className="rounded-xl p-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 lg:hidden focus-visible:ring-2 focus-visible:ring-gima-navy min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex flex-col py-1">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gima-navy">
              GIMA STUDIO
            </span>
            <span className="text-slate-300 font-bold">/</span>
            <h1 className="text-base sm:text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight">
              {current.title}
            </h1>
          </div>
          <p className="hidden md:block text-xs sm:text-sm text-slate-600 font-medium">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick actions & status */}
      <div className="flex items-center gap-3">
        {/* Knowledge quick pill */}
        <Link
          href="/knowledge"
          className="hidden sm:flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50/90 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-colors"
        >
          <BookOpen className="h-4 w-4 text-gima-navy" />
          <span>39 Clinical Sources Indexed</span>
        </Link>

        {/* Primary Create CTA on Header for rapid access */}
        {pathname !== '/create' && (
          <Link
            href="/create"
            className="flex items-center gap-2 rounded-xl bg-gima-navy px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-subtle hover:bg-gima-navy-light transition-all active:scale-[0.98] min-h-[42px]"
          >
            <Sparkles className="h-4 w-4 text-gima-gold-light" />
            <span className="hidden sm:inline">New Creative</span>
            <span className="sm:hidden">Create</span>
          </Link>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-gima-navy min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors relative"
            aria-label="System notifications"
            aria-expanded={notificationOpen}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-elevated z-50 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-bold text-slate-900">System Pipeline Status</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="mt-3 space-y-2.5 text-sm">
                <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <p className="font-bold text-slate-900">Free Course PDFs Verified</p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 pl-6">
                    12 authoritative PDFs extracted from Theories of Aging curriculum.
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-gima-navy shrink-0" />
                    <p className="font-bold text-slate-900">Generation Engines Ready</p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 pl-6">
                    Pollinations AI, Verified Free Models, and Offline Demo engines configured.
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-right">
                <button
                  onClick={() => setNotificationOpen(false)}
                  className="text-xs sm:text-sm font-semibold text-gima-navy hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
