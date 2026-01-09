import { useState, useEffect } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  LogIn, 
  Type, 
  Palette, 
  Download, 
  Trash2, 
  Info, 
  Check, 
  Layout, 
  Smartphone,
  Moon,
  Monitor
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import AuthDialog from '../auth/AuthDialog';
import { toast } from 'sonner@2.0.3';

const THEMES = [
  { id: 'default', name: 'Default (Pure Black)', bg: '#000000' },
  { id: 'charcoal', name: 'Charcoal', bg: '#121212' },
  { id: 'midnight', name: 'Midnight Blue', bg: '#020617' },
  { id: 'forest', name: 'Deep Green', bg: '#010a05' },
];

const FONTS = [
  { id: 'sans', name: 'System Sans', style: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { id: 'serif', name: 'Serif', style: 'Georgia, Cambria, "Times New Roman", Times, serif' },
  { id: 'mono', name: 'Monospace', style: '"Courier New", Courier, monospace' },
];

export default function SettingsPage() {
  const [session, setSession] = useState<any>(null);
  const [authOpen, setAuthOpen] = useState(false);
  // Get install prompt from RootLayout context
  const { installPrompt, setInstallPrompt } = useOutletContext<any>() || {}; 
  const [settings, setSettings] = useState({
    theme: 'default',
    font: 'sans',
    showForYou: false,
    showHistory: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Auth State
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Load Settings
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
  };

  const updateSetting = (key: keyof typeof settings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    if (key === 'theme') {
      localStorage.setItem('theme_preference', value as string);
      window.dispatchEvent(new Event('theme-change')); // Notify RootLayout
      toast.success('Theme updated');
    } else if (key === 'font') {
      localStorage.setItem('font_preference', value as string);
      window.dispatchEvent(new Event('font-change')); // Notify RootLayout
      toast.success('Font updated');
    } else if (key === 'showForYou') {
      localStorage.setItem('show_foryou_home', String(value));
      toast.success(`"For You" ${value ? 'enabled' : 'disabled'} on homepage`);
    } else if (key === 'showHistory') {
      localStorage.setItem('show_history_home', String(value));
      toast.success(`"Watch History" ${value ? 'enabled' : 'disabled'} on homepage`);
    }
  };

  const handleInstallClick = async () => {
    if (!installPrompt) {
      toast.info('Installation not available. Open in Chrome/Edge or Add to Home Screen manually.');
      return;
    }
    
    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        toast.success('App installation started');
      } else {
        toast.info('Installation cancelled');
      }
      setInstallPrompt(null);
    } catch (err) {
      console.error('Install prompt failed:', err);
      toast.error('Failed to open install prompt');
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all local library data (Favorites, History)? This cannot be undone.')) {
      localStorage.removeItem('favorites');
      localStorage.removeItem('history');
      // We don't clear settings or auth
      toast.success('Library data cleared');
      // Force reload to reflect changes
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 pb-20 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>
      
      <div className="space-y-8">
        {/* Account Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--brand-primary)]">
            <User className="w-5 h-5" /> Account
          </h2>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            {session ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{session.user.email}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Signed in</p>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Not signed in</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Sign in to sync your library</p>
                </div>
                <button 
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white hover:opacity-90 rounded-lg transition"
                >
                  <LogIn className="w-4 h-4" /> Sign In / Sign Up
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Appearance Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--brand-primary)]">
            <Palette className="w-5 h-5" /> Appearance
          </h2>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-6">
            
            {/* Theme */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[var(--muted-foreground)] block">Color Theme</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => updateSetting('theme', theme.id)}
                    className={`relative p-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                      settings.theme === theme.id 
                        ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 ring-1 ring-[var(--brand-primary)]' 
                        : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-full border border-white/10 shadow-sm" 
                      style={{ backgroundColor: theme.bg }} 
                    />
                    <span className="text-xs font-medium text-center">{theme.name}</span>
                    {settings.theme === theme.id && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--brand-primary)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Font */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[var(--muted-foreground)] block flex items-center gap-2">
                <Type className="w-4 h-4" /> Website Font
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {FONTS.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => updateSetting('font', font.id)}
                    className={`px-4 py-3 rounded-lg border text-left transition-all ${
                      settings.font === font.id
                        ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                        : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'
                    }`}
                    style={{ fontFamily: font.style }}
                  >
                    <span className="text-sm font-medium">{font.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Homepage Preferences */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--brand-primary)]">
            <Layout className="w-5 h-5" /> Homepage Content
          </h2>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl divide-y divide-[var(--border)]">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--background)] rounded-lg">
                   <Monitor className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <div>
                  <p className="font-medium">Show "For You"</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Display recommendations row on homepage</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.showForYou}
                  onChange={(e) => updateSetting('showForYou', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-[var(--input)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand-primary)]"></div>
              </label>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--background)] rounded-lg">
                   <Smartphone className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <div>
                  <p className="font-medium">Show "Watch History"</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Display recent history row on homepage</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.showHistory}
                  onChange={(e) => updateSetting('showHistory', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-[var(--input)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand-primary)]"></div>
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
        className="flex items-center justify-center gap-3 p-4 rounded-xl border border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/20 cursor-pointer transition"
      >
        <Download className="w-5 h-5" />
        <div className="text-left">
          <p className="font-medium">Install App</p>
          <p className="text-xs opacity-70">Download as PWA</p>
        </div>
      </button>
    {/* Clear Library Data */}
    <button
      onClick={handleClearData}
      className="flex items-center justify-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 hover:bg-red-500/10 transition cursor-pointer"
    >
      <Trash2 className="w-5 h-5" />
      <div className="text-left">
        <p className="font-medium">Clear Library Data</p>
        <p className="text-xs opacity-70">Delete local history & favorites</p>
      </div>
    </button>

    {/* Reset Site */}
    <button
      onClick={async () => {
        if (confirm('Are you sure you want to reset the site? All site data, caches, and settings will be erased.')) {
          // Clear localStorage
          localStorage.clear();

          // Clear caches
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
          }

          // Unregister service workers
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(reg => reg.unregister()));
          }

          // Reload
          window.location.href = '/';
        }
      }}
     className="flex items-center justify-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 hover:bg-red-500/10 transition cursor-pointer"

    >
      <Trash2 className="w-5 h-5" />
      <div className="text-left">
        <p className="font-medium">Reset Site</p>
        <p className="text-xs opacity-70">Erase all site data & settings</p>
      </div>
    </button>
  </div>
</section>


        {/* Info */}
        <section className="space-y-4">
           <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--brand-primary)]">
            <Info className="w-5 h-5" /> About
          </h2>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Disclaimer & Legal</p>
                <p className="text-sm text-[var(--muted-foreground)]">Read our content disclaimer</p>
              </div>
              <Link 
                to="/disclaimer"
                className="px-4 py-2 bg-[var(--muted)] hover:bg-[var(--muted)]/80 rounded-lg text-sm transition"
              >
                View Disclaimer
              </Link>
            </div>
          </div>
        </section>
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
