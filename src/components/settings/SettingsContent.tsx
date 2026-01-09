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
    if (confirm('Are you sure you want to clear your entire library? This will remove all watchlist items, favorites, and watch history.')) {
      clearLibrary();
      alert('Library cleared successfully');
      window.location.reload();
    }
  };

  const handleInstallPWA = async () => {
    const isSamsung = /SamsungBrowser/i.test(navigator.userAgent);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      alert(choice.outcome === 'accepted' ? 'PWA installed successfully' : 'PWA installation canceled');
    } else if (isSamsung) {
      alert('On Samsung Internet, open the menu and tap "Add to Home Screen" to install this app.');
    } else {
      alert('PWA installation is not available in this browser. Use the "Add to Home Screen" option from your browser menu.');
    }
  };

  const handleResetSite = () => {
    if (confirm('This will erase all site data, cache, library, and settings. Are you sure you want to reset the site?')) {
      localStorage.clear();
      caches.keys().then(names => names.forEach(name => caches.delete(name)));
      alert('Site reset successfully. Reloading...');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 p-4">
      {/* Clear Library */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">Clear Library</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Remove all items from your watchlist, favorites, and watch history. Cannot be undone.</p>
        </div>
        <button onClick={handleClearLibrary} className="ml-4 flex items-center gap-2 px-4 py-2 bg-[var(--error)] rounded-lg text-white hover:opacity-90">
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </div>

      {/* Install PWA */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">Install as App</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Install this website as a Progressive Web App for offline access.</p>
        </div>
        <button onClick={handleInstallPWA} className="ml-4 flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] rounded-lg text-white hover:opacity-90">
          <Download className="w-4 h-4" />
          Install
        </button>
      </div>

      {/* Reset Site */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">Reset Site</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Erase all site data, cache, library, and settings. Cannot be undone.</p>
        </div>
        <button onClick={handleResetSite} className="ml-4 flex items-center gap-2 px-4 py-2 bg-[var(--error)] rounded-lg text-white hover:opacity-90">
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
}
