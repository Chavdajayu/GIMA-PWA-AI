'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export const PwaRegister = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered successfully:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    }

    // Capture install prompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      console.log('[PWA] User accepted install');
    }
    setInstallPrompt(null);
    setShowInstallBanner(false);
  };

  if (!showInstallBanner) return null;

  return (
    <div
      role="banner"
      aria-label="PWA install banner"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-3.5 rounded-2xl border border-slate-300 bg-white p-4 shadow-elevated animate-fade-in max-w-md"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gima-navy text-white shadow-subtle">
        <Download className="h-5 w-5 text-gima-gold-light" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base font-bold text-slate-900">Install GIMA AI Studio</p>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">Access creative suite directly from desktop</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="rounded-xl bg-gima-navy px-3.5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-gima-navy-light transition-colors min-h-[38px]"
        >
          Install
        </button>
        <button
          onClick={() => setShowInstallBanner(false)}
          className="rounded-xl px-2.5 py-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 min-h-[38px]"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
