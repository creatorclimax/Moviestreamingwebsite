import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Download, Layers } from 'lucide-react';
import { getSeasonDetails, getTMDBImageUrl } from '../../lib/tmdb';
import { Season, Episode } from '../../lib/types';

interface SeasonEpisodeListProps {
  season: Season;
  tvId: number;
}

export default function SeasonEpisodeList({ season, tvId }: SeasonEpisodeListProps) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchEpisodes() {
      if (!season) return;
      
      setLoading(true);
      try {
        const data = await getSeasonDetails(tvId, season.season_number);
        if (data && data.episodes) {
          setEpisodes(data.episodes);
        }
      } catch (err) {
        console.error("Failed to fetch episodes", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEpisodes();
  }, [tvId, season]);

  if (loading) {
     return (
       <div className="flex justify-center py-12">
         <div className="animate-spin w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full" />
       </div>
     );
  }

  return (
    <div className="flex flex-col gap-10 pb-4">
      {episodes.map((episode) => (
        <div key={episode.id} className="flex flex-col md:flex-row gap-8 group">
           {/* Thumbnail Section */}
           <div className="w-full md:w-[320px] shrink-0 relative aspect-video bg-[var(--muted)] rounded-lg overflow-hidden shadow-sm border border-[var(--border)]/50">
             {episode.still_path ? (
               <img src={getTMDBImageUrl(episode.still_path, 'w500')} alt={episode.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
             ) : (
               <div className="w-full h-full flex items-center justify-center">
                 <Layers className="size-8 text-[var(--muted-foreground)]" />
               </div>
             )}
             <Link 
               to={`/stream/tv/${tvId}?season=${season.season_number}&episode=${episode.episode_number}`}
               className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
             >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <Play className="w-8 h-8 text-white fill-current ml-1" />
                </div>
             </Link>
           </div>
           
           {/* Content Section */}
           <div className="flex-1 flex flex-col min-w-0 gap-6">
             <div className="flex justify-between items-start gap-4">
               <h4 className="font-semibold text-2xl text-[var(--foreground)] leading-snug">
                 {episode.episode_number}. {episode.name}
               </h4>
               <div className="flex items-center gap-3 shrink-0">
                 {episode.air_date && (
                   <span className="text-sm text-[var(--muted-foreground)] hidden sm:block">
                     {new Date(episode.air_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                   </span>
                 )}
                 {episode.runtime && (
                   <span className="text-sm text-[var(--muted-foreground)] font-medium whitespace-nowrap bg-[var(--muted)] px-2 py-1 rounded">
                     {episode.runtime}m
                   </span>
                 )}
               </div>
             </div>
             
             <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 leading-relaxed max-w-2xl">
               {episode.overview}
             </p>
             
             {/* Action Buttons */}
             <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link 
                  to={`/stream/tv/${tvId}?season=${season.season_number}&episode=${episode.episode_number}`}
                  className="inline-flex h-14 items-center justify-center gap-3 px-8 bg-[var(--brand-primary)] text-white text-base font-medium rounded-lg hover:bg-[var(--brand-primary)]/90 transition-all shadow-sm active:scale-95 min-w-[180px]"
                >
                  <Play className="size-5 fill-current" /> 
                  <span>Play Episode</span>
                </Link>
                <Link 
                  to={`/download/tv/${tvId}?season=${season.season_number}&episode=${episode.episode_number}`}
                  className="inline-flex h-14 items-center justify-center gap-3 px-8 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-base font-medium rounded-lg hover:bg-[var(--muted)] transition-all shadow-sm active:scale-95 min-w-[180px]"
                >
                  <Download className="size-5" /> 
                  <span>Download</span>
                </Link>
             </div>
           </div>
        </div>
      ))}
    </div>
  );
}
