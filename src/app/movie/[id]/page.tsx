import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Play, Download, Star, Calendar, Clock, Bookmark, Heart } from 'lucide-react';
import {
  getMovieDetails,
  getMovieCredits,
  getMovieReviews,
  getSimilarMovies,
  getTMDBBackdropUrl,
  getTMDBImageUrl
} from '@/lib/tmdb';
import { formatRuntime, formatDate, formatMoney } from '@/lib/utils';
import MovieRow from '@/components/movie/MovieRow';
import LibraryActions from '@/components/movie/LibraryActions';

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const movie = await getMovieDetails(parseInt(id));
    
    return {
      title: movie.title,
      description: movie.overview,
      openGraph: {
        title: movie.title,
        description: movie.overview,
        images: [getTMDBImageUrl(movie.poster_path, 'original')]
      }
    };
  } catch {
    return {
      title: 'Movie Not Found'
    };
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  
  let movie, credits, reviews, similar;
  
  try {
    [movie, credits, reviews, similar] = await Promise.all([
      getMovieDetails(parseInt(id)),
      getMovieCredits(parseInt(id)),
      getMovieReviews(parseInt(id)),
      getSimilarMovies(parseInt(id))
    ]);
  } catch {
    notFound();
  }

  const director = credits.crew.find(c => c.job === 'Director');
  const writers = credits.crew.filter(c => c.department === 'Writing').slice(0, 3);

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] md:h-[70vh]">
        <div className="absolute inset-0">
          <img
            src={getTMDBBackdropUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
        </div>

        <div className="relative h-full container mx-auto px-4 flex items-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 w-full">
            {/* Poster */}
            <div className="flex-none w-48 md:w-64">
              <img
                src={getTMDBImageUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                className="w-full rounded-lg shadow-2xl"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="mb-2">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-[var(--muted-foreground)] italic mb-4">{movie.tagline}</p>
              )}
              
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[var(--brand-accent)]" fill="currentColor" />
                  <span>{movie.vote_average.toFixed(1)} ({movie.vote_count.toLocaleString()} votes)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(movie.release_date)}</span>
                </div>
                {movie.runtime && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map(genre => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-[var(--muted)] rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <a
                  href={`/stream/movie/${movie.id}`}
                  className="flex items-center gap-2 px-8 py-3 bg-[var(--brand-primary)] hover:opacity-90 transition rounded-lg"
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  <span>Stream Now</span>
                </a>
                <a
                  href={`/download/movie/${movie.id}`}
                  className="flex items-center gap-2 px-8 py-3 bg-[var(--brand-accent)] hover:opacity-90 transition rounded-lg"
                >
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </a>
                <LibraryActions item={{ ...movie, media_type: 'movie' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div>
              <h2 className="mb-4">Overview</h2>
              <p className="text-[var(--muted-foreground)] leading-relaxed">{movie.overview}</p>
            </div>

            {/* Cast */}
            {credits.cast.length > 0 && (
              <div>
                <h2 className="mb-4">Cast</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {credits.cast.slice(0, 8).map(person => (
                    <div key={person.id} className="text-center">
                      <div className="aspect-square rounded-lg overflow-hidden bg-[var(--muted)] mb-2">
                        <img
                          src={getTMDBImageUrl(person.profile_path)}
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm font-medium">{person.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.results.length > 0 && (
              <div>
                <h2 className="mb-4">Reviews</h2>
                <div className="space-y-4">
                  {reviews.results.slice(0, 3).map(review => (
                    <div key={review.id} className="bg-[var(--card)] p-6 rounded-lg border border-[var(--border)]">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)] flex items-center justify-center">
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
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[var(--card)] p-6 rounded-lg border border-[var(--border)]">
              <h3 className="mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                {director && (
                  <div>
                    <p className="text-[var(--muted-foreground)]">Director</p>
                    <p>{director.name}</p>
                  </div>
                )}
                {writers.length > 0 && (
                  <div>
                    <p className="text-[var(--muted-foreground)]">Writers</p>
                    <p>{writers.map(w => w.name).join(', ')}</p>
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
          </div>
        </div>

        {/* Similar Movies */}
        {similar.results.length > 0 && (
          <div className="mt-12">
            <MovieRow
              title="Similar Movies"
              items={similar.results}
              type="movie"
            />
          </div>
        )}
      </div>
    </div>
  );
}
