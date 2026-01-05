import { Movie, TVShow, TMDBResponse, Cast, Crew, Review, Episode, Genre, Person } from './types';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// TMDB API via Supabase Proxy
const getTmdbBaseUrl = () => {
  if (!projectId) {
    console.error('TMDB API Error: projectId is not defined in utils/supabase/info');
    throw new Error('Configuration error: Missing projectId');
  }
  return `https://${projectId}.supabase.co/functions/v1/make-server-188c0e85/media`;
};

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Helper to filter out unreleased content
function filterReleased<T>(results: T[]): T[] {
  const today = new Date().toISOString().split('T')[0];
  return results.filter((item: any) => {
    // Check for Movie release date
    if (item.release_date !== undefined) {
      if (!item.release_date) return false; // Filter out null/empty dates
      return item.release_date <= today;
    }
    // Check for TV Show first air date
    if (item.first_air_date !== undefined) {
      if (!item.first_air_date) return false; // Filter out null/empty dates
      return item.first_air_date <= today;
    }
    // Keep items without dates (e.g., People, Collections)
    return true;
  });
}

// Generic TMDB fetch wrapper
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const baseUrl = getTmdbBaseUrl();
  const url = new URL(`${baseUrl}${endpoint}`);
  
  // Note: API Key is handled by the backend proxy securely
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      // Create a specific error object or message that we can identify later
      const errorBody = await response.text();
      throw new Error(`TMDB API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }
    
    const data = await response.json();

    // Global filter for unreleased content in lists
    if (data) {
      // Top-level arrays
      if (Array.isArray(data.results)) data.results = filterReleased(data.results);
      if (Array.isArray(data.parts)) data.parts = filterReleased(data.parts);
      if (Array.isArray(data.cast)) data.cast = filterReleased(data.cast);
      if (Array.isArray(data.crew)) data.crew = filterReleased(data.crew);

      // Nested objects from append_to_response (similar, recommendations, credits, etc.)
      ['similar', 'recommendations', 'credits', 'videos'].forEach(key => {
        if (data[key] && typeof data[key] === 'object') {
          if (Array.isArray(data[key].results)) {
            data[key].results = filterReleased(data[key].results);
          }
          if (Array.isArray(data[key].cast)) {
            data[key].cast = filterReleased(data[key].cast);
          }
          if (Array.isArray(data[key].crew)) {
            data[key].crew = filterReleased(data[key].crew);
          }
        }
      });
    }

    return data;
  } catch (error: any) {
    // Reduce noise for 404 errors (resource not found)
    if (error.message && error.message.includes('404')) {
      console.warn(`TMDB Resource missing: ${url.toString()}`);
    } else {
      console.error(`Failed to fetch from TMDB Proxy: ${url.toString()}`, error);
    }
    throw error;
  }
}

// Image URL helpers
export function getTMDBImageUrl(path: string | null, size: 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!path) return 'https://placehold.co/500x750?text=No+Image'; // Better placeholder
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export function getTMDBBackdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!path) return 'https://placehold.co/1280x720?text=No+Backdrop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

// Movies
export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'day'): Promise<Movie[]> {
  const data = await tmdbFetch<TMDBResponse<Movie>>(`/trending/movie/${timeWindow}`);
  return data.results;
}

export async function getTopRatedMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>('/movie/top_rated', { page: page.toString() });
}

export async function getPopularMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>('/movie/popular', { page: page.toString() });
}

export async function getNowPlayingMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>('/movie/now_playing', { page: page.toString() });
}

export async function getUpcomingMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>('/movie/upcoming', { page: page.toString() });
}

export async function getMovieDetails(id: number): Promise<Movie> {
  return tmdbFetch<Movie>(`/movie/${id}`, { append_to_response: 'credits,reviews,similar,videos' });
}

export async function getMovieCredits(id: number): Promise<{ cast: Cast[]; crew: Crew[] }> {
  return tmdbFetch(`/movie/${id}/credits`);
}

export async function getMovieReviews(id: number): Promise<TMDBResponse<Review>> {
  return tmdbFetch(`/movie/${id}/reviews`);
}

export async function getSimilarMovies(id: number): Promise<TMDBResponse<Movie>> {
  return tmdbFetch(`/movie/${id}/similar`);
}

export async function getCollection(id: number): Promise<any> {
  const BLACKLISTED_IDS = [297, 1198, 472502];
  if (BLACKLISTED_IDS.includes(id)) {
      return null;
  }
  try {
    return await tmdbFetch(`/collection/${id}`);
  } catch (error: any) {
    // Return null for 404s to allow callers to handle gracefully without try/catch noise
    if (error.message && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

// TV Shows
export async function getTrendingTV(timeWindow: 'day' | 'week' = 'day'): Promise<TVShow[]> {
  const data = await tmdbFetch<TMDBResponse<TVShow>>(`/trending/tv/${timeWindow}`);
  return data.results;
}

export async function getTopRatedTV(page: number = 1): Promise<TMDBResponse<TVShow>> {
  return tmdbFetch<TMDBResponse<TVShow>>('/tv/top_rated', { page: page.toString() });
}

export async function getPopularTV(page: number = 1): Promise<TMDBResponse<TVShow>> {
  return tmdbFetch<TMDBResponse<TVShow>>('/tv/popular', { page: page.toString() });
}

export async function getOnTheAirTV(page: number = 1): Promise<TMDBResponse<TVShow>> {
  return tmdbFetch<TMDBResponse<TVShow>>('/tv/on_the_air', { page: page.toString() });
}

export async function getTVDetails(id: number): Promise<TVShow> {
  return tmdbFetch<TVShow>(`/tv/${id}`, { append_to_response: 'credits,reviews,similar,videos' });
}

export async function getTVCredits(id: number): Promise<{ cast: Cast[]; crew: Crew[] }> {
  return tmdbFetch(`/tv/${id}/credits`);
}

export async function getTVReviews(id: number): Promise<TMDBResponse<Review>> {
  return tmdbFetch(`/tv/${id}/reviews`);
}

export async function getSimilarTV(id: number): Promise<TMDBResponse<TVShow>> {
  return tmdbFetch(`/tv/${id}/similar`);
}

export async function getSeasonDetails(tvId: number, seasonNumber: number): Promise<any> {
  return tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`);
}

// Discover with filters
export async function discoverMovies(params: {
  page?: number;
  with_genres?: string;
  sort_by?: string;
  with_original_language?: string;
  primary_release_year?: number;
  first_air_date_year?: number;
  with_origin_country?: string;
  'vote_average.gte'?: number;
  'vote_count.gte'?: number;
  include_adult?: boolean;
}): Promise<TMDBResponse<Movie>> {
  const queryParams: Record<string, string> = {
    page: (params.page || 1).toString(),
    include_adult: 'false',
    include_video: 'false',
    ...Object.fromEntries(
      Object.entries(params)
        .filter(([key, value]) => value !== undefined && key !== 'page')
        .map(([key, value]) => [key, String(value)])
    )
  };
  
  return tmdbFetch<TMDBResponse<Movie>>('/discover/movie', queryParams);
}

export async function discoverTV(params: {
  page?: number;
  with_genres?: string;
  sort_by?: string;
  with_original_language?: string;
  first_air_date_year?: number;
  with_origin_country?: string;
  'vote_average.gte'?: number;
  'vote_count.gte'?: number;
  include_adult?: boolean;
}): Promise<TMDBResponse<TVShow>> {
  const queryParams: Record<string, string> = {
    page: (params.page || 1).toString(),
    include_adult: 'false',
    include_null_first_air_dates: 'false',
    ...Object.fromEntries(
      Object.entries(params)
        .filter(([key, value]) => value !== undefined && key !== 'page')
        .map(([key, value]) => [key, String(value)])
    )
  };
  
  return tmdbFetch<TMDBResponse<TVShow>>('/discover/tv', queryParams);
}

// Search
export async function searchMovies(query: string, page: number = 1): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>('/search/movie', { query, page: page.toString() });
}

export async function searchTV(query: string, page: number = 1): Promise<TMDBResponse<TVShow>> {
  return tmdbFetch<TMDBResponse<TVShow>>('/search/tv', { query, page: page.toString() });
}

export async function searchMulti(query: string, page: number = 1): Promise<TMDBResponse<Movie | TVShow | Person>> {
  return tmdbFetch<TMDBResponse<Movie | TVShow | Person>>('/search/multi', { query, page: page.toString() });
}

export async function searchCollections(query: string, page: number = 1): Promise<TMDBResponse<any>> {
  return tmdbFetch<TMDBResponse<any>>('/search/collection', { query, page: page.toString() });
}

// Genres
export async function getMovieGenres(): Promise<Genre[]> {
  const data = await tmdbFetch<{ genres: Genre[] }>('/genre/movie/list');
  return data.genres;
}

export async function getTVGenres(): Promise<Genre[]> {
  const data = await tmdbFetch<{ genres: Genre[] }>('/genre/tv/list');
  return data.genres;
}

// Specialized queries
export async function getKoreanDramas(page: number = 1): Promise<TMDBResponse<TVShow>> {
  return discoverTV({
    page,
    with_original_language: 'ko',
    sort_by: 'popularity.desc'
  });
}

export async function getAnime(page: number = 1): Promise<TMDBResponse<TVShow>> {
  return discoverTV({
    page,
    with_genres: '16', // Animation genre
    with_original_language: 'ja',
    sort_by: 'popularity.desc'
  });
}

// Person
export async function getPersonDetails(id: number): Promise<any> {
  return tmdbFetch<any>(`/person/${id}`, { append_to_response: 'combined_credits,external_ids,images' });
}

export async function getPersonCredits(id: number): Promise<any> {
    return tmdbFetch<any>(`/person/${id}/combined_credits`);
}
