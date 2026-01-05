import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import StreamPlayer from '../player/StreamPlayer';
import SeasonEpisodeSelector from '../movie/SeasonEpisodeSelector';
import { ArrowLeft, Download } from 'lucide-react';

export default function StreamPage() {
  const { type, id } = useParams<{ type: 'movie' | 'tv', id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  if (!type || !id) return null;

  const seasonParam = searchParams.get('season');
  const episodeParam = searchParams.get('episode');
  
  // Default to season 1, episode 1 for TV shows if not specified
  const season = type === 'tv' ? (seasonParam ? parseInt(seasonParam) : 1) : undefined;
  const episode = type === 'tv' ? (episodeParam ? parseInt(episodeParam) : 1) : undefined;

  const handleSeasonEpisodeChange = (newSeason: number, newEpisode: number) => {
    navigate(`/stream/tv/${id}?season=${newSeason}&episode=${newEpisode}`, { replace: true });
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Back Button Container - Identical to MovieDetailsPage */}
      {/* Positioned absolutely at top-8 (32px) */}
      <div className="absolute left-0 right-0 bottom-0 top-8 pointer-events-none z-40">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <button 
              onClick={() => navigate(`/${type}/${id}`, { replace: true })}
              className="pointer-events-auto flex items-center gap-2 text-white/80 hover:text-[var(--brand-primary)] transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-lg">Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Explicit Spacer to prevent overlap */}
      {/* Pushes content down by 72px (18 * 4px) */}
      <div className="h-[4.5rem] w-full shrink-0" aria-hidden="true" />

      <div className="container mx-auto px-4 pb-20 flex-1">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Now Streaming</h1>
            <p className="text-xl text-[var(--muted-foreground)] mb-6">
              You are watching content ID: {id} ({type})
              {season && episode && ` - S${season}:E${episode}`}
            </p>

            {type === 'tv' && season && episode && (
              <SeasonEpisodeSelector 
                tmdbId={parseInt(id)} 
                currentSeason={season} 
                currentEpisode={episode}
                onSelect={handleSeasonEpisodeChange}
              />
            )}
          </div>
        
          <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <StreamPlayer 
              tmdbId={parseInt(id)} 
              type={type} 
              season={season}
              episode={episode}
            />
          </div>

          <div className="flex justify-center w-full">
            <button
              onClick={() => {
                let url = `/download/${type}/${id}`;
                if (type === 'tv' && season && episode) {
                  url += `?season=${season}&episode=${episode}`;
                }
                navigate(url, { state: { from: 'stream' } });
              }}
              className="flex items-center !gap-4 !px-12 !py-5 bg-white/10 hover:bg-white/20 transition rounded-xl text-white font-medium text-base backdrop-blur-sm border border-white/10"
            >
              <Download className="w-5 h-5 shrink-0" />
              <span className="whitespace-nowrap">Download {type === 'movie' ? 'Movie' : 'Episode'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
