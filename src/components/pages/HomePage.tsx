import { useState, useEffect } from 'react';
import HeroSlider from '../hero/HeroSlider';
import MovieRow from '../movie/MovieRow';
import {
  getTrendingMovies,
  getTrendingTV,
  getTopRatedMovies,
  getTopRatedTV,
  getKoreanDramas,
  getAnime,
  getPopularMovies,
  getPopularTV
} from '../../lib/tmdb';
import { Movie, TVShow } from '../../lib/types';
import Seo from '../seo/Seo';
import HomeHistoryRow from '../home/HomeHistoryRow';
import HomeRecommendationsRow from '../home/HomeRecommendationsRow';

export default function HomePage() {
  const [showForYou, setShowForYou] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [data, setData] = useState<{
    trendingMovies: Movie[];
    trendingTV: TVShow[];
    topMovies: Movie[];
    topTV: TVShow[];
    koreanDramas: TVShow[];
    anime: TVShow[];
    popularMovies: Movie[];
    popularTV: TVShow[];
    loading: boolean;
  }>({
    trendingMovies: [],
    trendingTV: [],
    topMovies: [],
    topTV: [],
    koreanDramas: [],
    anime: [],
    popularMovies: [],
    popularTV: [],
    loading: true
  });

  useEffect(() => {
    setShowForYou(localStorage.getItem('show_foryou_home') === 'true');
    setShowHistory(localStorage.getItem('show_history_home') === 'true');
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
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

        setData({
          trendingMovies,
          trendingTV,
          topMovies: topMoviesData.results,
          topTV: topTVData.results,
          koreanDramas: koreanDramasData.results,
          anime: animeData.results,
          popularMovies: popularMoviesData.results,
          popularTV: popularTVData.results,
          loading: false
        });
      } catch (error) {
        console.error("Failed to fetch home data", error);
        setData(prev => ({ ...prev, loading: false }));
      }
    }

    fetchData();
  }, []);

  if (data.loading) {
    return <div className="min-h-screen pt-20 flex items-center justify-center">Loading content...</div>;
  }

  // Top 10 Today: Mixed Movies & TV, sorted by popularity
  const top10Combined = [
    ...data.trendingMovies.map(m => ({ ...m, media_type: 'movie' as const })),
    ...data.trendingTV.map(t => ({ ...t, media_type: 'tv' as const }))
  ]
  .sort((a, b) => b.popularity - a.popularity)
  .slice(0, 10);

  // Combine Popular + Trending (deduplicated)
  const combinedPopularMovies = [
    ...data.popularMovies,
    ...data.trendingMovies
  ].filter((item, index, self) => 
    index === self.findIndex((t) => t.id === item.id)
  );

  const combinedPopularTV = [
    ...data.popularTV,
    ...data.trendingTV
  ].filter((item, index, self) => 
    index === self.findIndex((t) => t.id === item.id)
  );

  return (
    <div className="pb-8">
      <Seo 
        title="Home" 
        description="Stream your favorite movies and TV shows. Discover trending content, top rated series, and more."
      />
      {/* Hero Slider */}
      <HeroSlider movies={data.trendingMovies.slice(0, 5)} />

      {/* Content Rows */}
      <div className="container mx-auto px-4 md:px-8 mt-12 space-y-16">
        {/* User Preferences Rows */}
        {showHistory && <HomeHistoryRow />}
        {showForYou && <HomeRecommendationsRow />}

        {/* 1. Top 10 Today */}
        <MovieRow
          title="Top 10 Today"
          items={top10Combined}
          type="movie" // It handles mixed types if items have media_type
          showRank={true}
        />

        {/* 2. Popular Movies (Combined with Trending) */}
        <MovieRow
          title="Popular Movies"
          items={combinedPopularMovies}
          type="movie"
        />

        {/* 3. Top Rated Movies */}
        <MovieRow
          title="Top Rated Movies"
          items={data.topMovies}
          type="movie"
        />

        {/* 4. Popular TV Series (Combined with Trending) */}
        <MovieRow
          title="Popular TV Series"
          items={combinedPopularTV}
          type="tv"
        />

        {/* 5. Top Rated Series */}
        <MovieRow
          title="Top Rated TV Series"
          items={data.topTV}
          type="tv"
        />

        {/* 6. Top Korean Dramas */}
        <MovieRow
          title="Top Korean Dramas"
          items={data.koreanDramas}
          type="tv"
        />

        {/* 7. Top Anime */}
        <MovieRow
          title="Top Anime"
          items={data.anime}
          type="tv"
        />
      </div>
    </div>
  );
}
