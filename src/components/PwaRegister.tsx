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
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-elevated animate-fade-in max-w-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gima-navy text-white">
        <Download className="h-4 w-4 text-gima-gold-light" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-900">Install GIMA AI Studio</p>
        <p className="text-[11px] text-slate-500">Access creative suite directly from desktop</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleInstallClick}
          className="rounded-lg bg-gima-navy px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-gima-navy-light"
        >
          Install
        </button>
        <button
          onClick={() => setShowInstallBanner(false)}
          className="rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:text-slate-700"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
