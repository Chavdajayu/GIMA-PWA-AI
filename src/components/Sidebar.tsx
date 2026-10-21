'use client';

import React from 'react';
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
  User,
  X
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
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

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen = false,
  onMobileClose,
  collapsed = false,
  onToggleCollapse,
}) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}
        aria-label="Main Navigation"
      >
        {/* Header / Brand Logo */}
        <div className="flex h-18 items-center justify-between border-b border-slate-200 px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gima-navy rounded-lg p-1"
            onClick={onMobileClose}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gima-navy text-white shadow-subtle ring-1 ring-gima-navy-dark">
              <span className="font-bold text-xl text-gima-gold-light tracking-wide">G</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-base tracking-tight text-gima-navy-dark">
                  GIMA AI STUDIO
                </span>
                <span className="text-xs text-slate-600 font-medium truncate">
                  Creative Intelligence
                </span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden focus-visible:ring-2 focus-visible:ring-gima-navy min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close sidebar menu"
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
                className={`group flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm sm:text-base font-semibold transition-all min-h-[46px] ${
                  isActive
                    ? 'bg-gima-navy text-white shadow-sm'
                    : item.highlight
                    ? 'bg-amber-50 text-amber-950 hover:bg-amber-100/90 border border-amber-300'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors ${
                    isActive
                      ? 'text-gima-gold-light'
                      : item.highlight
                      ? 'text-amber-700'
                      : 'text-slate-500 group-hover:text-slate-900'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate">
                    {item.label}
                  </span>
                )}
                {!collapsed && item.highlight && !isActive && (
                  <span className="ml-auto rounded-full bg-amber-200/90 px-2 py-0.5 text-xs font-bold text-amber-950 uppercase tracking-wide">
                    New
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-slate-200 p-3 space-y-2.5 bg-slate-50/60">
          {/* Status Indicator */}
          {!collapsed ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-300/80 p-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-xs font-bold text-emerald-950">
                  GIMA Knowledge Synced
                </span>
              </div>
              <p className="mt-1 text-xs text-emerald-900 font-medium">
                12 PDFs & 27 Site routes active
              </p>
            </div>
          ) : (
            <div className="flex justify-center py-2" title="GIMA Knowledge Synced (12 PDFs & 27 Site routes active)">
              <div className="h-3 w-3 rounded-full bg-emerald-600 ring-4 ring-emerald-100 animate-pulse" />
            </div>
          )}

          {/* Admin User Card */}
          <div className="flex items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-slate-100 transition-colors">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-800 font-bold">
              <User className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">GIMA Marketing Admin</p>
                <p className="truncate text-xs text-slate-600 font-medium">Internal Creative Studio</p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <div className="hidden pt-1 lg:flex justify-end">
              <button
                onClick={onToggleCollapse}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-gima-navy min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
