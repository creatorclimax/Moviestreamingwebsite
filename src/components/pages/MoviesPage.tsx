import { useState, useEffect, useRef } from 'react';
import { Loader2, X } from 'lucide-react';
import { discoverMovies, getMovieGenres } from '../../lib/tmdb';
import { COUNTRIES } from '../../lib/countries';
import MovieCard from '../movie/MovieCard';
import { Button } from '../ui/button';
import { Pagination } from '../ui/pagination-control';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Genre } from '../../lib/types';

const MIN_VOTES_OPTIONS = [
  { value: '0', label: 'Any Votes' },
  { value: '100', label: '100+ Votes' },
  { value: '500', label: '500+ Votes' },
  { value: '1000', label: '1k+ Votes' },
  { value: '5000', label: '5k+ Votes' },
];

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Top Rated' },
  { value: 'primary_release_date.desc', label: 'Newest' },
  { value: 'primary_release_date.asc', label: 'Oldest' },
  { value: 'revenue.desc', label: 'Highest Revenue' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => (CURRENT_YEAR - i).toString());

export default function MoviesPage() {
  // Filters
  const [page, setPage] = useState(1);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [minVotes, setMinVotes] = useState<string>('0');
  
  // Data
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const isFirstRender = useRef(true);

  // Fetch Genres on mount
  useEffect(() => {
    async function fetchGenres() {
      try {
        const data = await getMovieGenres();
        setGenres(data);
      } catch (e) {
        console.error("Failed to load genres", e);
      }
    }
    fetchGenres();
  }, []);

  // Fetch Movies on filter change
  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      try {
        // Construct params
        const params: any = {
          page,
          sort_by: sortBy,
        };

        // Fix: Filter out unreleased movies when sorting by newest
        if (sortBy === 'primary_release_date.desc') {
          params['primary_release_date.lte'] = new Date().toISOString().split('T')[0];
          params['vote_count.gte'] = 0; // Allow 0 votes for newest releases
        }

        if (selectedGenre !== 'all') params.with_genres = selectedGenre;
        if (selectedCountry !== 'all') params.with_origin_country = selectedCountry;
        if (selectedYear !== 'all') params.primary_release_year = parseInt(selectedYear);
        
        const voteCount = parseInt(minVotes);
        if (voteCount > 0) params['vote_count.gte'] = voteCount;

        // If sorting by rating, ensure we have some votes to avoid 1-vote wonders
        if (sortBy === 'vote_average.desc' && voteCount < 100) {
           params['vote_count.gte'] = 100;
        }

        const data = await discoverMovies(params);
        setMovies(data.results);
        setTotalPages(data.total_pages);
      } catch (error) {
        console.error('Failed to fetch movies', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
    
    // Only scroll smoothly on filter changes, not on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page, selectedGenre, selectedCountry, selectedYear, sortBy, minVotes]);

  // Reset function
  const resetFilters = () => {
    setSelectedGenre('all');
    setSelectedCountry('all');
    setSelectedYear('all');
    setSortBy('popularity.desc');
    setMinVotes('0');
    setPage(1);
  };

  // Reset page when filters change (except page itself)
  useEffect(() => {
    setPage(1);
  }, [selectedGenre, selectedCountry, selectedYear, sortBy, minVotes]);

  return (
    <div className="container mx-auto px-4 py-12 pb-20">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Explore Movies</h1>
          {/* Reset Button (Mobile/Desktop) */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <X className="w-4 h-4 mr-2" /> Reset Filters
          </Button>
        </div>
        
        {/* Filters Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Genre */}
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger>
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map(g => (
                <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Country */}
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {COUNTRIES.map(c => (
                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year */}
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {YEARS.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Votes */}
          <Select value={minVotes} onValueChange={setMinVotes}>
            <SelectTrigger>
              <SelectValue placeholder="Votes" />
            </SelectTrigger>
            <SelectContent>
               {MIN_VOTES_OPTIONS.map(o => (
                 <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
               ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-12 w-full" aria-hidden="true" />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--brand-primary)]" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mb-8">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                item={movie}
                type="movie"
              />
            ))}
          </div>
          
          <div className="h-12 w-full" aria-hidden="true" />

          <Pagination 
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            maxPage={50}
          />
        </>
      )}
    </div>
  );
}
