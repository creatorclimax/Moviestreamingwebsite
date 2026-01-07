import { useEffect, useState } from 'react';

type BrowserType = 'chrome' | 'samsung' | 'firefox' | 'other';

export default function PWAInstallChecker() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [browser, setBrowser] = useState<BrowserType>('other');

  useEffect(() => {
    const ua = navigator.userAgent;

    if (/SamsungBrowser/i.test(ua)) setBrowser('samsung');
    else if (/Firefox/i.test(ua)) setBrowser('firefox');
    else if (/Chrome/i.test(ua)) setBrowser('chrome');
    else setBrowser('other');

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

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        background: '#111',
        color: '#fff',
        padding: '12px 14px',
        borderRadius: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ fontSize: 13, marginBottom: 6 }}>
        Install StreamFlix App
      </div>

      <button
        onClick={handleInstall}
        style={{
          background: '#e50914',
          border: 'none',
          padding: '6px 14px',
          borderRadius: 6,
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        Install
      </button>
    </div>
  );
}
