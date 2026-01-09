'use client';

import { Trash2, Download, RotateCcw } from 'lucide-react';
import { clearLibrary } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function SettingsContent() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleClearLibrary = () => {
    if (
      confirm(
        'Are you sure you want to clear your entire library? This will remove all watchlist items, favorites, and watch history.'
      )
    ) {
      clearLibrary();
      alert('Library cleared successfully');
      window.location.reload();
    }
  };

  const handleInstallPWA = async () => {
    const isSamsung = /SamsungBrowser/i.test(navigator.userAgent);

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        alert('PWA installed successfully');
      } else {
        alert('PWA installation canceled');
      }
      setDeferredPrompt(null);
    } else if (isSamsung) {
      alert('On Samsung Internet, open the menu and tap "Add to Home Screen" to install this app.');
    } else {
      alert('Use the browser menu and choose "Add to Home Screen" to install.');
    }
  };

  // ✅ RESET ENTIRE APP DATA
  const handleResetApp = async () => {
    const ok = confirm(
      'This will reset the app to default.\n\nAll site data, cache, settings and offline files will be erased. Continue?'
    );
    if (!ok) return;

    try {
      // Clear storages
      localStorage.clear();
      sessionStorage.clear();

      // Clear IndexedDB
      if (indexedDB.databases) {
        const dbs = await indexedDB.databases();
        dbs.forEach((db) => {
          if (db.name) indexedDB.deleteDatabase(db.name);
        });
      }

      // Clear Cache Storage
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.unregister();
        }
      }

      alert('App reset completed. Reloading...');
      window.location.href = '/';
    } catch (err) {
      console.error('Reset failed', err);
      alert('Reset failed. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Clear Library */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg mb-2">Clear Library</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Remove all items from your watchlist, favorites, and watch history.
          </p>
        </div>
        <button
          onClick={handleClearLibrary}
          className="ml-4 flex items-center gap-2 px-4 py-2 bg-[var(--error)] hover:opacity-90 transition rounded-lg text-white"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear</span>
        </button>
      </div>

      {/* Install PWA */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg mb-2">Install as App</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Install this app for faster loading and offline support.
          </p>
        </div>
        <button
          onClick={handleInstallPWA}
          className="ml-4 flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] hover:opacity-90 transition rounded-lg"
        >
          <Download className="w-4 h-4" />
          <span>Install</span>
        </button>
      </div>

      {/* Reset App */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg mb-2">Reset Application</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Erase all site data, cache, settings and offline files. App returns to default state.
          </p>
        </div>
        <button
          onClick={handleResetApp}
          className="ml-4 flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:opacity-90 transition rounded-lg text-black"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* About */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <h3 className="text-lg mb-2">About</h3>
        <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
          <p>Version: 1.0.0</p>
          <p>Built with React, Vite and TMDB API</p>
        </div>
      </div>
    </div>
  );
}
