import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, Check } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import HistoryContent from '../library/HistoryContent';
import FavoritesContent from '../library/FavoritesContent';
import DownloadsContent from '../library/DownloadsContent';
import RecommendationsContent from '../library/RecommendationsContent';
import AuthDialog from '../auth/AuthDialog';

export default function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('recommendations');
  const [authOpen, setAuthOpen] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 min-h-screen">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Library</h1>
          
          <button
            onClick={() => setAuthOpen(true)}
            className={`flex items-center !gap-4 !px-8 !py-4 transition rounded-xl text-white font-medium text-base backdrop-blur-sm border border-white/10 w-fit ${
              session ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20' : 'bg-white/10 hover:bg-white/20'
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
          {/* Tabs Navigation */}
          <div className="flex items-center gap-12 border-b border-white/10 overflow-x-auto no-scrollbar w-full">
            <button 
              onClick={() => handleTabChange('recommendations')}
              className={`pb-6 px-4 text-xl font-medium whitespace-nowrap transition-all relative outline-none ${activeTab === 'recommendations' ? 'text-[var(--brand-primary)]' : 'text-[var(--muted-foreground)] hover:text-white'}`}
            >
              For You
              {activeTab === 'recommendations' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-lg bg-[var(--brand-primary)] shadow-[0_0_20px_var(--brand-primary)]" />
              )}
            </button>
            <button 
              onClick={() => handleTabChange('favorites')}
              className={`pb-6 px-4 text-xl font-medium whitespace-nowrap transition-all relative outline-none ${activeTab === 'favorites' ? 'text-[var(--brand-primary)]' : 'text-[var(--muted-foreground)] hover:text-white'}`}
            >
              Favorites
              {activeTab === 'favorites' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-lg bg-[var(--brand-primary)] shadow-[0_0_20px_var(--brand-primary)]" />
              )}
            </button>
            <button 
              onClick={() => handleTabChange('history')}
              className={`pb-6 px-4 text-xl font-medium whitespace-nowrap transition-all relative outline-none ${activeTab === 'history' ? 'text-[var(--brand-primary)]' : 'text-[var(--muted-foreground)] hover:text-white'}`}
            >
              Watch History
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-lg bg-[var(--brand-primary)] shadow-[0_0_20px_var(--brand-primary)]" />
              )}
            </button>
            <button 
              onClick={() => handleTabChange('downloads')}
              className={`pb-6 px-4 text-xl font-medium whitespace-nowrap transition-all relative outline-none ${activeTab === 'downloads' ? 'text-[var(--brand-primary)]' : 'text-[var(--muted-foreground)] hover:text-white'}`}
            >
              Download History
              {activeTab === 'downloads' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-lg bg-[var(--brand-primary)] shadow-[0_0_20px_var(--brand-primary)]" />
              )}
            </button>
          </div>

          {/* Content Area */}
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
