'use client';
import { useEffect, useState } from 'react';

type BrowserType = 'chrome' | 'samsung' | 'firefox' | 'other';

export default function PWAInstallChecker() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [browser, setBrowser] = useState<BrowserType>('other');
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Detect if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setInstalled(isStandalone);

    // Detect browser
    const ua = navigator.userAgent;
    if (/SamsungBrowser/i.test(ua)) setBrowser('samsung');
    else if (/Firefox/i.test(ua)) setBrowser('firefox');
    else if (/Chrome/i.test(ua)) setBrowser('chrome');
    else setBrowser('other');

    // Listen for beforeinstallprompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('beforeinstallprompt captured');
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      console.log('Install choice:', choice.outcome);
      setDeferredPrompt(null);
      return;
    }

    if (browser === 'samsung') {
      alert('Tap the menu (≡) and choose "Add page to Home screen" to install.');
    } else if (browser === 'firefox') {
      alert('Open browser menu and tap "Install" or "Add to Home screen".');
    } else {
      alert('Open browser menu and choose "Add to Home screen" to install.');
    }
  };

  // Hide the button if app is installed
  if (installed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-[var(--card)] p-4 rounded-lg border border-[var(--border)] shadow-lg">
      <p className="mb-2 text-sm text-[var(--muted-foreground)]">Install {document.title} for a better experience.</p>
      <button
        onClick={handleInstall}
        className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:opacity-90 transition"
      >
        Install
      </button>
    </div>
  );
}
