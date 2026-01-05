import { Metadata } from 'next';
import MovieRow from '@/components/movie/MovieRow';
import {
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getTrendingMovies
} from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Movies',
  description: 'Browse our extensive collection of movies. From the latest releases to timeless classics.',
};

export default async function MoviesPage() {
  const [popular, topRated, nowPlaying, upcoming, trending] = await Promise.all([
    getPopularMovies(1),
    getTopRatedMovies(1),
    getNowPlayingMovies(1),
    getUpcomingMovies(1),
    getTrendingMovies('week')
  ]);

  return (
    <div className="container mx-auto px-4 py-12 pb-20">
      <h1 className="mb-8">Movies</h1>

      <div className="space-y-12">
        <MovieRow title="Trending This Week" items={trending} type="movie" />
        <MovieRow title="Popular Movies" items={popular.results} type="movie" />
        <MovieRow title="Top Rated" items={topRated.results} type="movie" />
        <MovieRow title="Now Playing" items={nowPlaying.results} type="movie" />
        <MovieRow title="Upcoming" items={upcoming.results} type="movie" />
      </div>
    </div>
  );
}
