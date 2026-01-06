import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navigation from '../navigation/Navigation';
import { getBrandingConfig, getThemeStyles, DEFAULT_BRANDING } from '../../lib/tenant';
import { BrandingConfig } from '../../lib/types';
import { fetchLibrary } from '../../lib/utils';
import '../../styles/globals.css';

export default function RootLayout() {
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      console.log('Captured beforeinstallprompt event');
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Sync library from backend on mount
  useEffect(() => {
    async function syncData() {
      // We only fetch if local storage is empty or stale? 
      // Actually, for a simple "sync", we might want to merge or just check existence.
      // For this "no login" implementation, let's just ensure we have data if local is empty.
      
      
      // Watchlist removed as per request


      const localFavorites = localStorage.getItem('favorites');
      if (!localFavorites) {
        const remoteFavorites = await fetchLibrary('favorites');
        if (remoteFavorites.length > 0) {
          localStorage.setItem('favorites', JSON.stringify(remoteFavorites));
        }
      }

      const localHistory = localStorage.getItem('history');
      if (!localHistory) {
        const remoteHistory = await fetchLibrary('history');
        if (remoteHistory.length > 0) {
          localStorage.setItem('history', JSON.stringify(remoteHistory));
        }
      }
    }
    
    syncData();
  }, []);

  // Register Service Worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register on load to avoid blocking initial load
      const registerSW = () => {
        // Use absolute path for SW to ensure it works from any route (e.g. /settings)
        // This assumes the app is hosted at the domain root, which is true for Figma previews.
        const swUrl = '/sw.js';

        navigator.serviceWorker.register(swUrl, { scope: '/' })
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            // Gracefully handle environment limitations (e.g. preview servers returning HTML for JS files)
            if (registrationError.message && registrationError.message.includes('MIME type')) {
              console.warn('PWA Service Worker registration skipped: Environment does not support serving raw JS assets (MIME type mismatch). This is expected in preview environments and will work in production.');
            } else {
              console.error('SW registration failed: ', registrationError);
            }
          });
      };
      
      // If window already loaded, register immediately
      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
        return () => window.removeEventListener('load', registerSW);
      }
    }
  }, []);

  useEffect(() => {
    async function loadBranding() {
      try {
        const config = await getBrandingConfig();
        setBranding(config);
      } catch (e) {
        console.error("Failed to load branding", e);
      } finally {
        setLoading(false);
      }
    }
    loadBranding();
  }, []);

  // Apply theme styles
  useEffect(() => {
    if (branding) {
      const styles = getThemeStyles(branding);
      const styleId = 'tenant-theme-styles';
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = styles;
    }
  }, [branding]);

  // Apply user preferences (theme/font)
  useEffect(() => {
    const applyAppearance = () => {
       // Font
       const font = localStorage.getItem('font_preference');
       if (font === 'serif') {
         document.body.style.fontFamily = 'Georgia, Cambria, "Times New Roman", Times, serif';
       } else if (font === 'mono') {
         document.body.style.fontFamily = '"Courier New", Courier, monospace';
       } else {
         document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
       }

       // Theme
       const theme = localStorage.getItem('theme_preference') || 'default';
       const root = document.documentElement;
       
       if (theme === 'charcoal') {
         root.style.setProperty('--background', '#121212');
         root.style.setProperty('--card', '#1E1E1E');
         root.style.setProperty('--border', '#2C2C2C');
         root.style.setProperty('--muted', '#1E1E1E');
       } else if (theme === 'midnight') {
         root.style.setProperty('--background', '#020617');
         root.style.setProperty('--card', '#0f172a');
         root.style.setProperty('--border', '#1e293b');
         root.style.setProperty('--muted', '#0f172a');
       } else if (theme === 'forest') {
         root.style.setProperty('--background', '#010a05');
         root.style.setProperty('--card', '#02120a');
         root.style.setProperty('--border', '#052e16');
         root.style.setProperty('--muted', '#02120a');
       } else {
         // Default (Pure Black)
         root.style.setProperty('--background', '#000000');
         root.style.setProperty('--card', '#1a1a1a');
         root.style.setProperty('--border', '#333333');
         root.style.setProperty('--muted', '#1a1a1a');
       }
    };

    applyAppearance();

    window.addEventListener('theme-change', applyAppearance);
    window.addEventListener('font-change', applyAppearance);

    return () => {
      window.removeEventListener('theme-change', applyAppearance);
      window.removeEventListener('font-change', applyAppearance);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
      <Helmet>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Helmet>
      <Navigation branding={branding} />
      
      <main className="min-h-screen">
        <Outlet context={{ branding, installPrompt, setInstallPrompt }} />
      </main>

      <footer className="bg-[var(--card)] border-t border-[var(--border)] py-12 mt-0">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-16">
            <div className="space-y-6">
              <h4 className="font-bold text-xl tracking-tight">{branding.brandName}</h4>
              <p className="text-[var(--muted-foreground)] leading-relaxed text-[12px] italic">
                Your ultimate destination for movies and TV shows.
              </p>
            </div>
            <div>
              <h4 className="!mb-7 text-base font-bold uppercase tracking-wider text-[var(--foreground)]">Browse</h4>
              <ul className="space-y-2 text-base">
                <li><Link to="/movies" className="text-[var(--muted-foreground)] hover:!text-[var(--brand-primary)] transition-colors">Movies</Link></li>
                <li><Link to="/tv" className="text-[var(--muted-foreground)] hover:!text-[var(--brand-primary)] transition-colors">TV Series</Link></li>
                <li><Link to="/search" className="text-[var(--muted-foreground)] hover:!text-[var(--brand-primary)] transition-colors">Search</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="!mb-7 text-base font-bold uppercase tracking-wider text-[var(--foreground)]">Library</h4>
              <ul className="space-y-2 text-base">
                <li><Link to="/foryou" className="text-[var(--muted-foreground)] hover:!text-[var(--brand-primary)] transition-colors">For You</Link></li>
                <li><Link to="/favorites" className="text-[var(--muted-foreground)] hover:!text-[var(--brand-primary)] transition-colors">Favorites</Link></li>
                <li><Link to="/history" className="text-[var(--muted-foreground)] hover:!text-[var(--brand-primary)] transition-colors">Watch History</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="!mb-7 text-base font-bold uppercase tracking-wider text-[var(--foreground)]">Support</h4>
              <ul className="space-y-2 text-base">
                <li><Link to="/settings" className="text-[var(--muted-foreground)] hover:!text-[var(--brand-primary)] transition-colors">Settings</Link></li>
                <li><Link to="/disclaimer" className="text-[var(--muted-foreground)] hover:!text-[var(--brand-primary)] transition-colors">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          <div className="!mt-16 pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--muted-foreground)]">
            <p>&copy; {new Date().getFullYear()} {branding.brandName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
