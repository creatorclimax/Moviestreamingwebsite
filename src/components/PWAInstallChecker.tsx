'use client';

import { useEffect, useState } from 'react';

export default function PWAInstallChecker() {
  const [installable, setInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [browser, setBrowser] = useState<'chrome' | 'samsung' | 'firefox' | 'other'>('other');

  useEffect(() => {
    // Detect browser
    const ua = navigator.userAgent;
    if (/Chrome/i.test(ua)) setBrowser('chrome');
    else if (/SamsungBrowser/i.test(ua)) setBrowser('samsung');
    else if (/Firefox/i.test(ua)) setBrowser('firefox');

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') alert('PWA installed successfully');
      else alert('Installation cancelled');
      setDeferredPrompt(null);
    } else {
      switch (browser) {
        case 'samsung':
          alert('On Samsung Internet, open the menu and tap "Add to Home Screen" to install this app.');
          break;
        case 'firefox':
          alert('On Firefox, use the browser menu "Add to Home Screen" to install this app.');
          break;
        default:
          alert('PWA installation is not available in this browser. Use the browser menu "Add to Home Screen".');
      }
    }
  };

  if (!installable && browser === 'chrome') return null; // Chrome will show the default prompt anyway

  return (
    <div className="fixed bottom-4 right-4 bg-[var(--card)] p-4 rounded-lg border border-[var(--border)] shadow-lg z-50">
      <p className="mb-2 text-sm text-[var(--muted-foreground)]">Install StreamFlix for a better experience.</p>
      <button
        onClick={handleInstall}
        className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:opacity-90 transition"
      >
        Install
      </button>
    </div>
  );
}
