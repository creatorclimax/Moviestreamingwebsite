import { Metadata } from 'next';
import MovieRow from '@/components/movie/MovieRow';
import {
  getPopularTV,
  getTopRatedTV,
  getOnTheAirTV,
  getTrendingTV,
  getKoreanDramas,
  getAnime
} from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'TV Series',
  description: 'Explore thousands of TV shows and series. From drama to comedy, reality to anime.',
};

export default async function TVPage() {
  const [popular, topRated, onTheAir, trending, kdramas, anime] = await Promise.all([
    getPopularTV(1),
    getTopRatedTV(1),
    getOnTheAirTV(1),
    getTrendingTV('week'),
    getKoreanDramas(1),
    getAnime(1)
  ]);

  return (
    <div className="container mx-auto px-4 py-12 pb-20">
      <h1 className="mb-8">TV Series</h1>

      <div className="space-y-12">
        <MovieRow title="Trending This Week" items={trending} type="tv" />
        <MovieRow title="Popular TV Shows" items={popular.results} type="tv" />
        <MovieRow title="Top Rated" items={topRated.results} type="tv" />
        <MovieRow title="On The Air" items={onTheAir.results} type="tv" />
        <MovieRow title="Korean Dramas" items={kdramas.results} type="tv" />
        <MovieRow title="Anime" items={anime.results} type="tv" />
      </div>
    </div>
  );
}
