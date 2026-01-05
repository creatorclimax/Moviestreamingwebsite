import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Download, Star, Calendar, Clock, ArrowLeft } from 'lucide-react';
import {
  getMovieDetails,
  getMovieCredits,
  getMovieReviews,
  getSimilarMovies,
  getCollection,
  getTMDBBackdropUrl,
  getTMDBImageUrl
} from '../../lib/tmdb';
import { formatRuntime, formatDate, formatMoney, addToHistory, addToDownloads } from '../../lib/utils';
import MovieRow from '../movie/MovieRow';
import LibraryActions from '../movie/LibraryActions';
import Seo from '../seo/Seo';
import ShareButton from '../common/ShareButton';

import CollapsibleSection from '../common/CollapsibleSection';

export default function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      setError(false);
      
      try {
        const numericId = parseInt(id);
        const [movie, credits, reviews, similar] = await Promise.all([
          getMovieDetails(numericId),
          getMovieCredits(numericId),
          getMovieReviews(numericId),
          getSimilarMovies(numericId)
        ]);

        let collectionParts: any[] = [];
        if (movie.belongs_to_collection) {
            try {
                const collection = await getCollection(movie.belongs_to_collection.id);
                if (collection) {
                    collectionParts = collection.parts || [];
                }
            } catch (err) {
                console.error("Failed to fetch collection", err);
            }
        }

        setData({ movie, credits, reviews, similar, collectionParts });
      } catch (e) {
        console.error("Failed to fetch movie details", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen pt-20 flex items-center justify-center">Loading movie details...</div>;
  }

  if (error || !data) {
    return <div className="min-h-screen pt-20 flex items-center justify-center">Movie not found</div>;
  }

  const { movie, credits, reviews, similar, collectionParts } = data;
  const director = credits.crew.find((c: any) => c.job === 'Director');
  const writers = credits.crew
    .filter((c: any) => c.department === 'Writing')
    .filter((item: any, index: number, self: any[]) => 
      index === self.findIndex((t) => t.id === item.id)
    )
    .slice(0, 3);

  // Combine Collection Parts and Similar Movies
  // Filter out the current movie
  const allRelated = [
    ...(collectionParts || []),
    ...(similar.results || [])
  ].filter((item: any, index, self) => 
    item.id !== movie.id && 
    index === self.findIndex((t) => (
      t.id === item.id
    ))
  );

  // Sorting logic for Similar Movies
  // Priority 1: Title Similarity (Word Overlap & Inclusion)
  // Priority 2: Original Order (TMDB Logic)
  const sortedSimilar = allRelated.sort((a: any, b: any) => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const getTokens = (str: string) => normalize(str).split(/\s+/).filter(t => t.length > 2 && !['the','and','for','of','with','from'].includes(t));
    
    const currentTitle = movie.title;
    const currentTokens = getTokens(currentTitle);
    
    const getScore = (item: any) => {
      let score = 0;
      const title = item.title;
      const normalizedTitle = normalize(title);
      const normalizedCurrent = normalize(currentTitle);
      
      // Collection Boost (Highest Priority)
      // Check if this item is in the collectionParts array
      if (collectionParts.some((p: any) => p.id === item.id)) {
        score += 1000; 
      }

      // Exact phrase match (inclusion) - High priority
      if (normalizedCurrent.includes(normalizedTitle) || normalizedTitle.includes(normalizedCurrent)) {
        score += 50;
      }
      
      // Word Overlap - Medium priority
      const tokens = getTokens(title);
      const intersection = currentTokens.filter((t: string) => tokens.includes(t));
      score += intersection.length * 10;
      
      // Starts with same word (Series likely)
      if (currentTokens.length > 0 && tokens.length > 0 && currentTokens[0] === tokens[0]) {
        score += 15;
      }

      // Preserve popularity/vote as tie breaker
      score += (item.popularity || 0) / 100;

      return score;
    };

    const scoreA = getScore(a);
    const scoreB = getScore(b);

    return scoreB - scoreA;
  });

  // Details Card Component
  const DetailsCard = ({ className }: { className?: string }) => (
    <div className={`bg-[var(--card)] p-8 rounded-lg border border-[var(--border)] ${className}`} style={{ padding: '2rem' }}>
      <h3 className="mb-4 text-xl font-bold">Details</h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-[var(--muted-foreground)]">Release Date</p>
          <p>{formatDate(movie.release_date)}</p>
        </div>
        {movie.runtime && (
          <div>
            <p className="text-[var(--muted-foreground)]">Runtime</p>
            <p>{formatRuntime(movie.runtime)}</p>
          </div>
        )}
        {movie.genres && movie.genres.length > 0 && (
          <div>
            <p className="text-[var(--muted-foreground)]">Genres</p>
            <p>{movie.genres.map((g: any) => g.name).join(', ')}</p>
          </div>
        )}
        {movie.production_countries && movie.production_countries.length > 0 && (
          <div>
            <p className="text-[var(--muted-foreground)]">Production Country</p>
            <p>{movie.production_countries.map((c: any) => c.name).join(', ')}</p>
          </div>
        )}
        {movie.spoken_languages && movie.spoken_languages.length > 0 && (
          <div>
            <p className="text-[var(--muted-foreground)]">Language</p>
            <p>{movie.spoken_languages.map((l: any) => l.english_name || l.name).join(', ')}</p>
          </div>
        )}
        {director && (
          <div>
            <p className="text-[var(--muted-foreground)]">Director</p>
            <Link to={`/person/${director.id}`} className="hover:text-[var(--brand-primary)] transition-colors">
              {director.name}
            </Link>
          </div>
        )}
        {writers.length > 0 && (
          <div>
            <p className="text-[var(--muted-foreground)]">Writers</p>
            <div className="flex flex-wrap gap-1">
              {writers.map((w: any, index: number) => (
                <span key={w.id}>
                  <Link to={`/person/${w.id}`} className="hover:text-[var(--brand-primary)] transition-colors">
                    {w.name}
                  </Link>
                  {index < writers.length - 1 && ", "}
                </span>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="text-[var(--muted-foreground)]">Status</p>
          <p>{movie.status}</p>
        </div>
        {movie.budget > 0 && (
          <div>
            <p className="text-[var(--muted-foreground)]">Budget</p>
            <p>{formatMoney(movie.budget)}</p>
          </div>
        )}
        {movie.revenue > 0 && (
          <div>
            <p className="text-[var(--muted-foreground)]">Revenue</p>
            <p>{formatMoney(movie.revenue)}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="pb-20">
      <Seo 
        title={movie.title} 
        description={movie.overview} 
        image={movie.poster_path}
        type="video.movie"
      />
      {/* Hero Section */}
      <div className="relative w-full min-h-[65vh] md:min-h-[75vh] flex flex-col">
        
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={getTMDBBackdropUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
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
                src={getTMDBImageUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                className="w-full rounded-xl shadow-2xl border border-white/10"
              />
            </div>

            {/* Info */}
            <div className="flex-1 max-w-4xl">
              <h1 className="mb-4 text-4xl md:text-5xl font-bold leading-tight">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-[var(--muted-foreground)] italic mb-6 text-lg md:text-xl font-light">{movie.tagline}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mb-8 text-sm md:text-base">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-lg border border-white/5">
                  <Star className="w-4 h-4 text-[var(--brand-accent)]" fill="currentColor" />
                  <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                  <span className="text-[var(--muted-foreground)] text-xs">({movie.vote_count.toLocaleString()})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span>{formatDate(movie.release_date)}</span>
                </div>
                {movie.runtime && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--muted-foreground)]" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-10">
                  {movie.genres.map((genre: any) => (
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
                  to={`/stream/movie/${movie.id}`}
                  onClick={() => addToHistory({ ...movie, media_type: 'movie' })}
                  className="flex items-center justify-center gap-4 px-6 md:px-12 h-[58px] bg-[var(--brand-primary)] hover:opacity-90 transition rounded-xl text-white font-medium text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full md:w-auto"
                >
                  <Play className="w-5 h-5 shrink-0" fill="currentColor" />
                  <span className="whitespace-nowrap">Stream Now</span>
                </Link>
                <Link
                  to={`/download/movie/${movie.id}`}
                  onClick={() => addToDownloads({ ...movie, media_type: 'movie' })}
                  className="flex items-center justify-center gap-4 px-6 md:px-12 h-[58px] bg-white/10 hover:bg-white/20 transition rounded-xl text-white font-medium text-base backdrop-blur-sm border border-white/10 w-full md:w-auto"
                >
                  <Download className="w-5 h-5 shrink-0" />
                  <span className="whitespace-nowrap">Download</span>
                </Link>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <LibraryActions item={{ ...movie, media_type: 'movie' }} className="flex-1 md:flex-none" />
                    <ShareButton 
                      type="movie" 
                      id={movie.id} 
                      title={movie.title}
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
              <p className="text-[var(--muted-foreground)] leading-relaxed text-lg">{movie.overview}</p>
            </div>

            {/* Mobile Details */}
            <div className="lg:hidden">
              <DetailsCard />
            </div>

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
                    .filter((p: any) => ['Producer', 'Director of Photography', 'Original Music Composer', 'Editor'].includes(p.job))
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

        {/* Similar Movies */}
        {sortedSimilar.length > 0 && (
          <div className="mt-20">
            <MovieRow
              title="Similar Movies"
              items={sortedSimilar}
              type="movie"
            />
          </div>
        )}
      </div>
    </div>
  );
}
