import { Metadata } from 'next';
import HeroSlider from '@/components/hero/HeroSlider';
import MovieRow from '@/components/movie/MovieRow';
import {
  getTrendingMovies,
  getTrendingTV,
  getTopRatedMovies,
  getTopRatedTV,
  getKoreanDramas,
  getAnime,
  getPopularMovies,
  getPopularTV
} from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Stream unlimited movies and TV shows. Watch the latest releases and timeless classics.',
};

export default async function HomePage() {
  // Fetch all data in parallel
  const [
    trendingMovies,
    trendingTV,
    topMoviesData,
    topTVData,
    koreanDramasData,
    animeData,
    popularMoviesData,
    popularTVData
  ] = await Promise.all([
    getTrendingMovies('day'),
    getTrendingTV('day'),
    getTopRatedMovies(1),
    getTopRatedTV(1),
    getKoreanDramas(1),
    getAnime(1),
    getPopularMovies(1),
    getPopularTV(1)
  ]);

  // Top 10: 5 movies + 5 TV shows
  const top10Movies = trendingMovies.slice(0, 5);
  const top10TV = trendingTV.slice(0, 5);
  const top10Combined = [
    ...top10Movies.map(m => ({ ...m, media_type: 'movie' as const })),
    ...top10TV.map(t => ({ ...t, media_type: 'tv' as const }))
  ].slice(0, 10);

  return (
    <div className="pb-20">
      {/* Hero Slider */}
      <HeroSlider movies={trendingMovies.slice(0, 5)} />

      {/* Content Rows */}
      <div className="container mx-auto px-4 mt-12 space-y-12">
        {/* Top 10 Today */}
        <MovieRow
          title="Top 10 Today"
          items={top10Combined}
          type="movie"
          showRank={true}
        />

        {/* Top Movies */}
        <MovieRow
          title="Top Rated Movies"
          items={topMoviesData.results}
          type="movie"
        />

        {/* Popular Movies */}
        <MovieRow
          title="Popular Movies"
          items={popularMoviesData.results}
          type="movie"
        />

        {/* Top TV Series */}
        <MovieRow
          title="Top Rated TV Series"
          items={topTVData.results}
          type="tv"
        />

        {/* Popular TV Series */}
        <MovieRow
          title="Popular TV Series"
          items={popularTVData.results}
          type="tv"
        />

        {/* Top K-Drama */}
        <MovieRow
          title="Top Korean Dramas"
          items={koreanDramasData.results}
          type="tv"
        />

        {/* Top Anime */}
        <MovieRow
          title="Top Anime"
          items={animeData.results}
          type="tv"
        />

        {/* Trending TV */}
        <MovieRow
          title="Trending TV Shows"
          items={trendingTV}
          type="tv"
        />
      </div>
    </div>
  );
}
