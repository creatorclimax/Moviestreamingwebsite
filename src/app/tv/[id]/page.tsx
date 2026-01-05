import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Play, Download, Star, Calendar, Tv as TvIcon } from 'lucide-react';
import {
  getTVDetails,
  getTVCredits,
  getTVReviews,
  getSimilarTV,
  getTMDBBackdropUrl,
  getTMDBImageUrl
} from '@/lib/tmdb';
import { formatDate } from '@/lib/utils';
import MovieRow from '@/components/movie/MovieRow';
import LibraryActions from '@/components/movie/LibraryActions';

interface TVPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TVPageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const tv = await getTVDetails(parseInt(id));
    
    return {
      title: tv.name,
      description: tv.overview,
      openGraph: {
        title: tv.name,
        description: tv.overview,
        images: [getTMDBImageUrl(tv.poster_path, 'original')]
      }
    };
  } catch {
    return {
      title: 'TV Show Not Found'
    };
  }
}

export default async function TVPage({ params }: TVPageProps) {
  const { id } = await params;
  
  let tv, credits, reviews, similar;
  
  try {
    [tv, credits, reviews, similar] = await Promise.all([
      getTVDetails(parseInt(id)),
      getTVCredits(parseInt(id)),
      getTVReviews(parseInt(id)),
      getSimilarTV(parseInt(id))
    ]);
  } catch {
    notFound();
  }

  const creators = tv.seasons ? [] : [];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] md:h-[70vh]">
        <div className="absolute inset-0">
          <img
            src={getTMDBBackdropUrl(tv.backdrop_path, 'original')}
            alt={tv.name}
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
                src={getTMDBImageUrl(tv.poster_path, 'w500')}
                alt={tv.name}
                className="w-full rounded-lg shadow-2xl"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="mb-2">{tv.name}</h1>
              
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[var(--brand-accent)]" fill="currentColor" />
                  <span>{tv.vote_average.toFixed(1)} ({tv.vote_count.toLocaleString()} votes)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(tv.first_air_date)}</span>
                </div>
                {tv.number_of_seasons && (
                  <div className="flex items-center gap-2">
                    <TvIcon className="w-4 h-4" />
                    <span>{tv.number_of_seasons} Season{tv.number_of_seasons > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {tv.genres && tv.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tv.genres.map(genre => (
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
                  href={`/stream/tv/${tv.id}`}
                  className="flex items-center gap-2 px-8 py-3 bg-[var(--brand-primary)] hover:opacity-90 transition rounded-lg"
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  <span>Stream Now</span>
                </a>
                <a
                  href={`/download/tv/${tv.id}`}
                  className="flex items-center gap-2 px-8 py-3 bg-[var(--brand-accent)] hover:opacity-90 transition rounded-lg"
                >
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </a>
                <LibraryActions item={{ ...tv, media_type: 'tv' }} />
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
              <p className="text-[var(--muted-foreground)] leading-relaxed">{tv.overview}</p>
            </div>

            {/* Seasons */}
            {tv.seasons && tv.seasons.length > 0 && (
              <div>
                <h2 className="mb-4">Seasons</h2>
                <div className="space-y-4">
                  {tv.seasons
                    .filter(season => season.season_number > 0)
                    .map(season => (
                    <div
                      key={season.id}
                      className="flex gap-4 bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]"
                    >
                      <div className="flex-none w-24">
                        <img
                          src={getTMDBImageUrl(season.poster_path)}
                          alt={season.name}
                          className="w-full rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg mb-1">{season.name}</h3>
                        <p className="text-sm text-[var(--muted-foreground)] mb-2">
                          {season.episode_count} Episodes • {season.air_date ? formatDate(season.air_date) : 'TBA'}
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                          {season.overview || 'No overview available.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                <div>
                  <p className="text-[var(--muted-foreground)]">Status</p>
                  <p>{tv.status}</p>
                </div>
                {tv.number_of_episodes && (
                  <div>
                    <p className="text-[var(--muted-foreground)]">Total Episodes</p>
                    <p>{tv.number_of_episodes}</p>
                  </div>
                )}
                {tv.episode_run_time && tv.episode_run_time.length > 0 && (
                  <div>
                    <p className="text-[var(--muted-foreground)]">Episode Runtime</p>
                    <p>{tv.episode_run_time[0]} minutes</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar TV Shows */}
        {similar.results.length > 0 && (
          <div className="mt-12">
            <MovieRow
              title="Similar TV Shows"
              items={similar.results}
              type="tv"
            />
          </div>
        )}
      </div>
    </div>
  );
}
