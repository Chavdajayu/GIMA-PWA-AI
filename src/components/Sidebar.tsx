'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  FolderKanban,
  BookOpen,
  Image as ImageIcon,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  X,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/create', label: 'Create Creative', icon: Sparkles, highlight: true },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
  { href: '/assets', label: 'Asset Library', icon: ImageIcon },
  { href: '/activity', label: 'Operational Log', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-gima-slate-border bg-white transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header / Brand Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gima-slate-border px-4">
          <Link href="/" className="flex items-center gap-3 overflow-hidden" onClick={onMobileClose}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gima-navy text-white shadow-subtle ring-1 ring-gima-navy-dark">
              <span className="font-semibold text-lg text-gima-gold-light tracking-wider">G</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-tight text-gima-navy-dark">
                  GIMA AI STUDIO
                </span>
                <span className="text-[10px] text-gima-slate-muted font-medium truncate">
                  Creative Intelligence
                </span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="rounded p-1 text-gima-slate-muted hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gima-navy text-white shadow-sm'
                    : item.highlight
                    ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-gima-gold-light'
                      : item.highlight
                      ? 'text-amber-700'
                      : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate">
                    {item.label}
                  </span>
                )}
                {!collapsed && item.highlight && !isActive && (
                  <span className="ml-auto rounded-full bg-amber-200/70 px-1.5 py-0.5 text-[9px] font-bold text-amber-900 uppercase">
                    New
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gima-slate-border p-3 space-y-2">
          {/* Status Indicator */}
          {!collapsed ? (
            <div className="rounded-lg bg-emerald-50/80 border border-emerald-200/70 p-2.5">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-[11px] font-semibold text-emerald-950">
                  GIMA Knowledge Synced
                </span>
              </div>
              <p className="mt-1 text-[10px] text-emerald-800">
                12 PDFs & 27 Site routes active
              </p>
            </div>
          ) : (
            <div className="flex justify-center py-1" title="Knowledge Foundation Active">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}

          {/* Admin User Card */}
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-slate-50 transition-colors">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700">
              <User className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-semibold text-slate-800">GIMA Marketing Admin</p>
                <p className="truncate text-[10px] text-slate-500">Internal Creative Studio</p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <div className="hidden pt-1 lg:flex justify-end">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
