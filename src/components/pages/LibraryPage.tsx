import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, Check } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';

import HistoryContent from '../library/HistoryContent';
import FavoritesContent from '../library/FavoritesContent';
import DownloadsContent from '../library/DownloadsContent';
import RecommendationsContent from '../library/RecommendationsContent';
import AuthDialog from '../auth/AuthDialog';

import { saveUserData, loadUserData } from '../../lib/utils';

export default function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('recommendations');
  const [authOpen, setAuthOpen] = useState(false);
  const [session, setSession] = useState<any>(null);

  /* ================= AUTH ================= */

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

    return () => subscription.unsubscribe();
  }, []);

  /* ================= TAB FROM URL ================= */

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['recommendations', 'favorites', 'history', 'downloads'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  /* ================= LOAD FROM CLOUD ON LOGIN ================= */

  useEffect(() => {
    if (!session?.user?.id) return;

    const syncFromCloud = async () => {
      const cloudLibrary = await loadUserData(session.user.id);

      if (!cloudLibrary) return;

      if (cloudLibrary.favorites)
        localStorage.setItem('favorites', JSON.stringify(cloudLibrary.favorites));

      if (cloudLibrary.history)
        localStorage.setItem('history', JSON.stringify(cloudLibrary.history));

      if (cloudLibrary.downloads)
        localStorage.setItem('downloads', JSON.stringify(cloudLibrary.downloads));

      if (cloudLibrary.recommendations)
        localStorage.setItem('recommendations', JSON.stringify(cloudLibrary.recommendations));

      window.dispatchEvent(new Event('library-updated'));
    };

    syncFromCloud();
  }, [session]);

  /* ================= SAVE TO CLOUD WHEN LIBRARY CHANGES ================= */

  useEffect(() => {
    if (!session?.user?.id) return;

    const handler = () => {
  console.log('SYNC EVENT FIRED');

  const data = {
    favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
    history: JSON.parse(localStorage.getItem('history') || '[]'),
    downloads: JSON.parse(localStorage.getItem('downloads') || '[]'),
    recommendations: JSON.parse(localStorage.getItem('recommendations') || '[]'),
  };

  console.log('SAVING TO CLOUD:', data);
  saveUserData(session.user.id, data);
};

      const data = {
        favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
        history: JSON.parse(localStorage.getItem('history') || '[]'),
        downloads: JSON.parse(localStorage.getItem('downloads') || '[]'),
        recommendations: JSON.parse(localStorage.getItem('recommendations') || '[]'),
      };

      saveUserData(session.user.id, data);
    };

    window.addEventListener('library-updated', handler);
    return () => window.removeEventListener('library-updated', handler);
  }, [session]);

  /* ================= UI ================= */

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 min-h-screen">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Library</h1>

          <button
            disabled={!!session}
            onClick={() => {
              if (!session) setAuthOpen(true);
            }}
            className={`flex items-center gap-4 px-8 py-4 transition rounded-xl font-medium text-base backdrop-blur-sm border w-fit
              ${session
                ? 'bg-green-500/10 text-green-400 border-green-500/20 cursor-not-allowed opacity-80'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/10 cursor-pointer'
              }`}
          >
            {session ? (
              <>
                <Check className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap">Synced</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap">Sync Account</span>
              </>
            )}
          </button>
        </div>

        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />

        <div className="flex flex-col gap-12">
          {/* Tabs */}
          <div className="flex items-center gap-12 border-b border-white/10 overflow-x-auto no-scrollbar w-full">
            {[
              ['recommendations', 'For You'],
              ['favorites', 'Favorites'],
              ['history', 'Watch History'],
              ['downloads', 'Download History'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`pb-6 px-4 text-xl font-medium whitespace-nowrap transition-all relative outline-none
                  ${activeTab === key
                    ? 'text-[var(--brand-primary)]'
                    : 'text-[var(--muted-foreground)] hover:text-white'
                  }`}
              >
                {label}
                {activeTab === key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-lg bg-[var(--brand-primary)] shadow-[0_0_20px_var(--brand-primary)]" />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="min-h-[400px] w-full pt-4">
            {activeTab === 'recommendations' && <RecommendationsContent />}
            {activeTab === 'favorites' && <FavoritesContent />}
            {activeTab === 'history' && <HistoryContent />}
            {activeTab === 'downloads' && <DownloadsContent />}
          </div>
        </div>
      </div>
    </div>
  );
}
