'use client';

import { Trash2, Download, RefreshCw } from 'lucide-react';
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
      alert(
        'PWA installation is not available in this browser. Use the "Add to Home Screen" option from your browser menu.'
      );
    }
  };

  const handleResetSite = () => {
    if (
      confirm(
        'This will erase all site data, settings, cache, and library. Are you sure you want to reset the site?'
      )
    ) {
      localStorage.clear();
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
      alert('Site reset successfully. The page will reload.');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Clear Library */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg mb-2">Clear Library</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Remove all items from your watchlist, favorites, and watch history. This action cannot be undone.
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
            Install this website as a Progressive Web App for a better experience and offline access.
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

      {/* Reset Site */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg mb-2">Reset Site</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Erase all site data, cache, library, and settings. This action cannot be undone.
          </p>
        </div>
        <button
          onClick={handleResetSite}
          className="ml-4 flex items-center gap-2 px-4 py-2 bg-[var(--error)] hover:opacity-90 transition rounded-lg text-white"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* About */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <h3 className="text-lg mb-2">About</h3>
        <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
          <p>Version: 1.0.0</p>
          <p>Built with Next.js 14 and TMDB API</p>
        </div>
      </div>
    </div>
  );
}
