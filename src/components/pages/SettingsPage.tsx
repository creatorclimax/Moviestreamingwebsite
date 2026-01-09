import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  User,
  LogOut,
  LogIn,
  Type,
  Palette,
  Download,
  Trash2,
  Info,
  Layout,
  Smartphone,
  Monitor
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import AuthDialog from '../auth/AuthDialog';
import { toast } from 'sonner';

const THEMES = [
  { id: 'default', name: 'Default (Pure Black)', bg: '#000000' },
  { id: 'charcoal', name: 'Charcoal', bg: '#121212' },
  { id: 'midnight', name: 'Midnight Blue', bg: '#020617' },
  { id: 'forest', name: 'Deep Green', bg: '#010a05' }
];

const FONTS = [
  { id: 'sans', name: 'System Sans', style: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { id: 'serif', name: 'Serif', style: 'Georgia, Cambria, "Times New Roman", Times, serif' },
  { id: 'mono', name: 'Monospace', style: '"Courier New", Courier, monospace' }
];

export default function SettingsPage() {
  const [session, setSession] = useState<any>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const { installPrompt, setInstallPrompt } = useOutletContext<any>() || {};
  const [installed, setInstalled] = useState(false);

  const [settings, setSettings] = useState({
    theme: 'default',
    font: 'sans',
    showForYou: false,
    showHistory: false
  });

  /* ---------------- PWA INSTALLED CHECK ---------------- */
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone;

    setInstalled(isStandalone);
  }, []);

  /* ---------------- AUTH + SETTINGS LOAD ---------------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
    });

    const savedTheme = localStorage.getItem('theme_preference') || 'default';
    const savedFont = localStorage.getItem('font_preference') || 'sans';
    const showForYou = localStorage.getItem('show_foryou_home') === 'true';
    const showHistory = localStorage.getItem('show_history_home') === 'true';

    setSettings({
      theme: savedTheme,
      font: savedFont,
      showForYou,
      showHistory
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ---------------- SETTINGS UPDATE ---------------- */
  const updateSetting = (key: keyof typeof settings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    if (key === 'theme') {
      localStorage.setItem('theme_preference', value as string);
      window.dispatchEvent(new Event('theme-change'));
      toast.success('Theme updated');
    }

    if (key === 'font') {
      localStorage.setItem('font_preference', value as string);
      window.dispatchEvent(new Event('font-change'));
      toast.success('Font updated');
    }

    if (key === 'showForYou') {
      localStorage.setItem('show_foryou_home', String(value));
      toast.success(`"For You" ${value ? 'enabled' : 'disabled'}`);
    }

    if (key === 'showHistory') {
      localStorage.setItem('show_history_home', String(value));
      toast.success(`"Watch History" ${value ? 'enabled' : 'disabled'}`);
    }
  };

  /* ---------------- AUTH ---------------- */
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
  };

  /* ---------------- PWA INSTALL ---------------- */
  const handleInstallClick = async () => {
    if (!installPrompt) {
      toast.info('Install not available on this device');
      return;
    }

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === 'accepted') {
        toast.success('Installation started');
      }

      setInstallPrompt(null);
    } catch (err) {
      console.error(err);
      toast.error('Install failed');
    }
  };

  /* ---------------- CLEAR LIBRARY ---------------- */
  const handleClearData = () => {
    if (confirm('Clear Favorites and History? This cannot be undone.')) {
      localStorage.removeItem('favorites');
      localStorage.removeItem('history');
      toast.success('Library cleared');
      window.location.reload();
    }
  };

  /* ---------------- RESET SITE ---------------- */
  const handleResetSite = async () => {
    if (!confirm('This will erase ALL site data and settings. Continue?')) return;

    localStorage.clear();

    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }

    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }

    window.location.href = '/';
  };

  return (
    <div className="container mx-auto px-4 py-12 pb-20 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>

      <div className="space-y-8">

        {/* ACCOUNT */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--brand-primary)]">
            <User className="w-5 h-5" /> Account
          </h2>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            {session ? (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{session.user.email}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Signed in</p>
                </div>

                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg"
                >
                  <LogOut className="inline w-4 h-4 mr-2" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Not signed in</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Sync your library</p>
                </div>

                <button
                  onClick={() => setAuthOpen(true)}
                  className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg"
                >
                  <LogIn className="inline w-4 h-4 mr-2" /> Sign In
                </button>
              </div>
            )}
          </div>
        </section>

        {/* APPEARANCE */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--brand-primary)]">
            <Palette className="w-5 h-5" /> Appearance
          </h2>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-6">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => updateSetting('theme', t.id)}
                  className={`p-3 rounded-lg border flex flex-col items-center gap-2 ${
                    settings.theme === t.id
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10'
                      : 'border-[var(--border)]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full" style={{ background: t.bg }} />
                  <span className="text-xs text-center">{t.name}</span>
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {FONTS.map(f => (
                <button
                  key={f.id}
                  onClick={() => updateSetting('font', f.id)}
                  style={{ fontFamily: f.style }}
                  className={`p-3 rounded-lg border text-left ${
                    settings.font === f.id
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10'
                      : 'border-[var(--border)]'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>

          </div>
        </section>

{/* Homepage Preferences */}
<section className="space-y-4">
  <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--brand-primary)]">
    <Layout className="w-5 h-5" /> Homepage Content
  </h2>

  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl divide-y divide-[var(--border)]">

    {/* For You */}
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[var(--background)] rounded-lg">
          <Monitor className="w-5 h-5 text-[var(--brand-primary)]" />
        </div>
        <div>
          <p className="font-medium">Show "For You"</p>
          <p className="text-xs text-[var(--muted-foreground)]">Display recommendations row</p>
        </div>
      </div>

      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={settings.showForYou}
          onChange={(e) => updateSetting('showForYou', e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-[var(--input)] rounded-full peer peer-checked:bg-[var(--brand-primary)]
          after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full
          after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full">
        </div>
      </label>
    </div>

    {/* History */}
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[var(--background)] rounded-lg">
          <Smartphone className="w-5 h-5 text-[var(--brand-primary)]" />
        </div>
        <div>
          <p className="font-medium">Show "Watch History"</p>
          <p className="text-xs text-[var(--muted-foreground)]">Display recent history row</p>
        </div>
      </div>

      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={settings.showHistory}
          onChange={(e) => updateSetting('showHistory', e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-[var(--input)] rounded-full peer peer-checked:bg-[var(--brand-primary)]
          after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full
          after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full">
        </div>
      </label>
    </div>

  </div>
</section>


     {/* App & Data */}
<section className="space-y-4">
  <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--brand-primary)]">
    <Smartphone className="w-5 h-5" /> Application
  </h2>

  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 grid gap-4 md:grid-cols-3">

    {/* Install App */}
    {!installed && (
      <button
        onClick={handleInstallClick}
        className="flex items-center justify-center gap-3 p-4 rounded-xl border
          border-[var(--brand-primary)] bg-[var(--brand-primary)]/10
          text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/20 transition"
      >
        <Download className="w-5 h-5" />
        <div className="text-left">
          <p className="font-medium">Install App</p>
          <p className="text-xs opacity-70">Download as PWA</p>
        </div>
      </button>
    )}

    {/* Clear Library */}
    <button
      onClick={handleClearData}
      className="flex items-center justify-center gap-3 p-4 rounded-xl border
        border-red-500/40 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition"
    >
      <Trash2 className="w-5 h-5" />
      <div className="text-left">
        <p className="font-medium">Clear Library</p>
        <p className="text-xs opacity-70">Remove history & favorites</p>
      </div>
    </button>

    {/* Reset Site */}
    <button
      onClick={handleResetSite}
      className="flex items-center justify-center gap-3 p-4 rounded-xl border
        border-red-700/40 bg-red-700/15 text-red-600 hover:bg-red-700/25 transition"
    >
      <Trash2 className="w-5 h-5" />
      <div className="text-left">
        <p className="font-medium">Reset Site</p>
        <p className="text-xs opacity-70">Erase all data & settings</p>
      </div>
    </button>

  </div>
</section>


        {/* ABOUT */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--brand-primary)]">
            <Info className="w-5 h-5" /> About
          </h2>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 flex justify-between items-center">
            <div>
              <p className="font-medium">Disclaimer & Legal</p>
              <p className="text-sm text-[var(--muted-foreground)]">Content disclaimer</p>
            </div>

            <Link to="/disclaimer" className="px-4 py-2 rounded-lg bg-[var(--muted)]">
              View
            </Link>
          </div>
        </section>

      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
