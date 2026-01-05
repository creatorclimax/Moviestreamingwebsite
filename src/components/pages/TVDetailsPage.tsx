import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Download, Star, Calendar, Layers, ArrowLeft } from 'lucide-react';
import {
  getTVDetails,
  getTVCredits,
  getTVReviews,
  getSimilarTV,
  searchTV,
  getTMDBBackdropUrl,
  getTMDBImageUrl
} from '../../lib/tmdb';
import { formatDate, addToHistory, addToDownloads } from '../../lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import MovieRow from '../movie/MovieRow';
import LibraryActions from '../movie/LibraryActions';
import SeasonEpisodeList from '../movie/SeasonEpisodeList';
import Seo from '../seo/Seo';
import ShareButton from '../common/ShareButton';

import CollapsibleSection from '../common/CollapsibleSection';

export default function TVDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      setError(false);
      setSelectedSeasonId(null);
      
      try {
        const numericId = parseInt(id);
        
        // Fetch show details first to get the name for search
        const show = await getTVDetails(numericId);

        const [credits, reviews, similar, searchResults] = await Promise.all([
          getTVCredits(numericId),
          getTVReviews(numericId),
          getSimilarTV(numericId),
          searchTV(show.name)
        ]);

        // Merge similar results with search results to ensure name matches are included
        const mergedResults = [
          ...(similar.results || []),
          ...(searchResults.results || [])
        ];

        // Create a synthetic similar object with merged results
        const enhancedSimilar = {
          ...similar,
          results: mergedResults
        };

        setData({ show, credits, reviews, similar: enhancedSimilar });
      } catch (e) {
        console.error("Failed to fetch TV details", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen pt-20 flex items-center justify-center">Loading TV details...</div>;
  }

  if (error || !data) {
    return <div className="min-h-screen pt-20 flex items-center justify-center">TV Show not found</div>;
  }

  const { show, credits, reviews, similar } = data;
  const creators = show.created_by || [];
  
  const selectedSeason = selectedSeasonId 
    ? show.seasons.find((s: any) => s.id === selectedSeasonId) 
    : (show.seasons.find((s: any) => s.season_number === 1) || show.seasons[0]);

  // Details Card Component
  const DetailsCard = ({ className }: { className?: string }) => (
    <div className={`bg-[var(--card)] p-8 rounded-lg border border-[var(--border)] ${className}`} style={{ padding: '2rem' }}>
      <h3 className="mb-4 text-xl font-bold">Details</h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-[var(--muted-foreground)]">First Air Date</p>
          <p>{formatDate(show.first_air_date)}</p>
        </div>
        {show.last_air_date && (
            <div>
            <p className="text-[var(--muted-foreground)]">Last Air Date</p>
            <p>{formatDate(show.last_air_date)}</p>
            </div>
        )}
        {show.genres && show.genres.length > 0 && (
          <div>
            <p className="text-[var(--muted-foreground)]">Genres</p>
            <p>{show.genres.map((g: any) => g.name).join(', ')}</p>
          </div>
        )}
        {show.production_countries && show.production_countries.length > 0 && (
          <div>
            <p className="text-[var(--muted-foreground)]">Production Country</p>
            <p>{show.production_countries.map((c: any) => c.name).join(', ')}</p>
          </div>
        )}
        {show.spoken_languages && show.spoken_languages.length > 0 && (
          <div>
            <p className="text-[var(--muted-foreground)]">Language</p>
            <p>{show.spoken_languages.map((l: any) => l.english_name || l.name).join(', ')}</p>
          </div>
        )}
        {creators.length > 0 && (
          <div>
            <p className="text-[var(--muted-foreground)]">Created By</p>
            <div className="flex flex-wrap gap-1">
              {creators.map((c: any, index: number) => (
                <span key={c.id}>
                  <Link to={`/person/${c.id}`} className="hover:text-[var(--brand-primary)] transition-colors">
                    {c.name}
                  </Link>
                  {index < creators.length - 1 && ", "}
                </span>
              ))}
            </div>
          </div>
        )}
        {show.networks && show.networks.length > 0 && (
          <div>
            <p className="text-[var(--muted-foreground)]">Network</p>
            <p>{show.networks.map((n: any) => n.name).join(', ')}</p>
          </div>
        )}
        <div>
          <p className="text-[var(--muted-foreground)]">Status</p>
          <p>{show.status}</p>
        </div>
      </div>
    </div>
  );

  // Sorting logic for Similar TV Shows
  // Priority 1: Title Similarity (Word Overlap & Inclusion)
  // Priority 2: Original Order (TMDB Logic)
  const sortedSimilar = similar.results ? 
    similar.results
      .filter((item: any, index: number, self: any[]) => 
        item.id !== show.id && 
        index === self.findIndex((t) => t.id === item.id)
      )
      .sort((a: any, b: any) => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const getTokens = (str: string) => normalize(str).split(/\s+/).filter(t => t.length > 2 && !['the','and','for','of','with','from'].includes(t));
    
    const currentTitle = show.name;
    const currentTokens = getTokens(currentTitle);
    
    const getScore = (item: any) => {
      let score = 0;
      const title = item.name;
      const normalizedTitle = normalize(title);
      const normalizedCurrent = normalize(currentTitle);
      
      // Exact phrase match (inclusion) - Highest priority
      if (normalizedTitle.includes(normalizedCurrent) || normalizedCurrent.includes(normalizedTitle)) {
        score += 1000;
      }
      
      // Word Overlap - High priority
      const tokens = getTokens(title);
      const intersection = currentTokens.filter((t: string) => tokens.includes(t));
      score += intersection.length * 100;
      
      // Starts with same word - Medium priority
      if (currentTokens.length > 0 && tokens.length > 0 && currentTokens[0] === tokens[0]) {
        score += 50;
      }

      // Preserve popularity/vote as tie breaker (minimized impact)
      score += (item.popularity || 0) / 10000;

      return score;
    };

    const scoreA = getScore(a);
    const scoreB = getScore(b);

    return scoreB - scoreA;
  }) : [];
  
  return (
    <div className="pb-20">
      <Seo 
        title={show.name} 
        description={show.overview} 
        image={show.poster_path}
        type="video.tv_show"
      />
      {/* Hero Section */}
      <div className="relative w-full min-h-[65vh] md:min-h-[75vh] flex flex-col">
        
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={getTMDBBackdropUrl(show.backdrop_path, 'original')}
            alt={show.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
        </div>

        {/* Back Button Container */}
        <div className="relative z-40 container mx-auto px-4 pt-14 pointer-events-none">
          <div className="max-w-6xl mx-auto">
             <button 
              onClick={() => navigate(-1)}
              className="pointer-events-auto flex items-center gap-2 text-white/80 hover:text-[var(--brand-primary)] transition-colors px-4 py-2 rounded-lg -ml-4 backdrop-blur-sm"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-lg">Back</span>
            </button>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 md:px-8 pb-16">
          <div className="flex flex-col md:flex-row gap-10 w-full items-end">
            {/* Poster */}
            <div className="flex-none w-52 md:w-72 hidden md:block">
              <img
                src={getTMDBImageUrl(show.poster_path, 'w500')}
                alt={show.name}
                className="w-full rounded-xl shadow-2xl border border-white/10"
              />
            </div>

            {/* Info */}
            <div className="flex-1 max-w-4xl">
              <h1 className="mb-4 text-4xl md:text-5xl font-bold leading-tight">{show.name}</h1>
              {show.tagline && (
                <p className="text-[var(--muted-foreground)] italic mb-6 text-lg md:text-xl font-light">{show.tagline}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mb-8 text-sm md:text-base">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-lg border border-white/5">
                  <Star className="w-4 h-4 text-[var(--brand-accent)]" fill="currentColor" />
                  <span className="font-semibold">{show.vote_average.toFixed(1)}</span>
                  <span className="text-[var(--muted-foreground)] text-xs">({show.vote_count.toLocaleString()})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span>{formatDate(show.first_air_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span>{show.number_of_seasons} Seasons</span>
                  <span className="text-[var(--muted-foreground)]">•</span>
                  <span>{show.number_of_episodes} Episodes</span>
                </div>
              </div>

              {/* Genres */}
              {show.genres && show.genres.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-10">
                  {show.genres.map((genre: any) => (
                    <span
                      key={genre.id}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 transition rounded-full text-sm font-medium backdrop-blur-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row flex-wrap gap-3 md:gap-8 w-full md:w-auto">
                <Link
                  to={`/stream/tv/${show.id}`}
                  onClick={() => addToHistory({ ...show, media_type: 'tv' })}
                  className="flex items-center justify-center gap-4 px-6 md:px-12 h-[58px] bg-[var(--brand-primary)] hover:opacity-90 transition rounded-xl text-white font-medium text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full md:w-auto"
                >
                  <Play className="w-5 h-5 shrink-0" fill="currentColor" />
                  <span className="whitespace-nowrap">Stream Now</span>
                </Link>
                <Link
                  to={`/download/tv/${show.id}?season=1&episode=1`}
                  onClick={() => addToDownloads({ ...show, media_type: 'tv' })}
                  className="flex items-center justify-center gap-4 px-6 md:px-12 h-[58px] bg-white/10 hover:bg-white/20 transition rounded-xl text-white font-medium text-base backdrop-blur-sm border border-white/10 w-full md:w-auto"
                >
                  <Download className="w-5 h-5 shrink-0" />
                  <span className="whitespace-nowrap">Download</span>
                </Link>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <LibraryActions item={{ ...show, media_type: 'tv' }} className="flex-1 md:flex-none" />
                    <ShareButton 
                      type="tv" 
                      id={show.id} 
                      title={show.name}
                      className="!w-[58px] !h-[58px] !rounded-xl shrink-0"
                    />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            {/* Overview */}
            <div>
              <h2 className="mb-6 text-2xl font-bold">Overview</h2>
              <p className="text-[var(--muted-foreground)] leading-relaxed text-lg">{show.overview}</p>
            </div>

            {/* Mobile Details */}
            <div className="lg:hidden">
              <DetailsCard />
            </div>

            {/* Seasons */}
            {show.seasons && show.seasons.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Seasons</h2>
                  <div className="w-[200px]">
                    <Select 
                      value={selectedSeason?.id.toString()} 
                      onValueChange={(val) => setSelectedSeasonId(parseInt(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Season" />
                      </SelectTrigger>
                      <SelectContent>
                        {show.seasons.map((season: any) => (
                          <SelectItem key={season.id} value={season.id.toString()}>
                            {season.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Spacer between header and list */}
                <div className="h-10" />
                
                {selectedSeason && (
                  <SeasonEpisodeList 
                    key={selectedSeason.id} 
                    season={selectedSeason} 
                    tvId={show.id} 
                  />
                )}
              </div>
            )}

            {/* Cast */}
            {credits.cast.length > 0 && (
              <CollapsibleSection title="Cast" defaultOpen={true}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {credits.cast.slice(0, 8).map((person: any, index: number) => (
                    <Link to={`/person/${person.id}`} key={`${person.id}-${index}`} className="text-center group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-[var(--muted)] mb-2">
                        <img
                          src={getTMDBImageUrl(person.profile_path)}
                          alt={person.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="text-sm font-medium group-hover:text-[var(--brand-primary)] transition-colors">{person.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{person.character}</p>
                    </Link>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Crew */}
            {credits.crew.length > 0 && (
              <CollapsibleSection title="Crew" defaultOpen={false}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {credits.crew
                    .filter((p: any) => ['Producer', 'Director of Photography', 'Original Music Composer', 'Editor', 'Executive Producer'].includes(p.job))
                    .reduce((acc: any[], current: any) => {
                      const x = acc.find(item => item.id === current.id);
                      if (!x) {
                        return acc.concat([current]);
                      } else {
                        return acc;
                      }
                    }, [])
                    .slice(0, 8)
                    .map((person: any) => (
                    <Link to={`/person/${person.id}`} key={`${person.id}-${person.job}`} className="text-center group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-[var(--muted)] mb-2">
                        <img
                          src={getTMDBImageUrl(person.profile_path)}
                          alt={person.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="text-sm font-medium group-hover:text-[var(--brand-primary)] transition-colors">{person.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{person.job}</p>
                    </Link>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Reviews */}
            {reviews.results.length > 0 && (
              <CollapsibleSection title="Reviews" defaultOpen={false}>
                <div className="!space-y-12">
                  {reviews.results.slice(0, 3).map((review: any) => (
                    <div key={review.id} className="bg-[var(--card)] p-8 rounded-lg border border-[var(--border)]" style={{ padding: '2rem' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)] flex items-center justify-center text-white font-bold">
                          {review.author[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{review.author}</p>
                          {review.author_details.rating && (
                            <p className="text-sm text-[var(--muted-foreground)]">
                              ★ {review.author_details.rating}/10
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-[var(--muted-foreground)] line-clamp-4">{review.content}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 hidden lg:block">
            <DetailsCard />
          </div>
        </div>

        {/* Similar TV Shows */}
        {sortedSimilar.length > 0 && (
          <div className="mt-20">
            <MovieRow
              title="Similar TV Series"
              items={sortedSimilar}
              type="tv"
            />
          </div>
        )}
      </div>
    </div>
  );
}
