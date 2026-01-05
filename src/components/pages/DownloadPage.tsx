import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { getDownloadUrl } from '../../lib/streaming';
import SeasonEpisodeSelector from '../movie/SeasonEpisodeSelector';
import { Download, AlertCircle, ArrowLeft } from 'lucide-react';

export default function DownloadPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  if (!type || !id) return null;
  
  const seasonParam = searchParams.get('season');
  const episodeParam = searchParams.get('episode');
  
  // Default to season 1, episode 1 for TV shows if not specified
  const season = type === 'tv' ? (seasonParam ? parseInt(seasonParam) : 1) : undefined;
  const episode = type === 'tv' ? (episodeParam ? parseInt(episodeParam) : 1) : undefined;

  const handleSeasonEpisodeChange = (newSeason: number, newEpisode: number) => {
    navigate(`/download/tv/${id}?season=${newSeason}&episode=${newEpisode}`, { replace: true });
  };
  
  const handleBack = () => {
    if (location.state?.from === 'stream') {
      navigate(-1);
    } else {
      navigate(`/${type}/${id}`, { replace: true });
    }
  };

  const downloadUrl = getDownloadUrl(
    type as 'movie' | 'tv', 
    parseInt(id),
    season,
    episode
  );

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Back Button Container - Identical to MovieDetailsPage */}
      {/* Positioned absolutely at top-8 (32px) */}
      <div className="absolute left-0 right-0 bottom-0 top-8 pointer-events-none z-40">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <button 
              onClick={handleBack}
              className="pointer-events-auto flex items-center gap-2 text-white/80 hover:text-[var(--brand-primary)] transition-colors px-4 py-2 rounded-lg -ml-4 backdrop-blur-sm"
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
          


          {/* Download Interface */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Download</h2>
              <p className="text-lg text-[var(--muted-foreground)]">
                Click the button below to access the download page
              </p>
            </div>

            {type === 'tv' && season && episode && (
              <div className="flex justify-center mb-8">
                 <SeasonEpisodeSelector
                    tmdbId={parseInt(id)}
                    currentSeason={season}
                    currentEpisode={episode}
                    onSelect={handleSeasonEpisodeChange}
                    variant="outline"
                 />
              </div>
            )}

            {/* Download Frame */}
            <div className="relative w-full bg-[var(--muted)] rounded-xl overflow-hidden h-[85vh] min-h-[800px]">
              <iframe
                src={downloadUrl}
                className="w-full h-full border-0"
                sandbox="allow-forms allow-scripts allow-same-origin allow-downloads"
                title="Download"
              />
            </div>

            <div className="mt-8 text-center">
              <p className="text-base text-[var(--muted-foreground)]">
                Having trouble? Try refreshing the page or contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}