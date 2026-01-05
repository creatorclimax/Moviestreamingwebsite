import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { searchMulti } from '../../lib/tmdb';
import MovieCard from '../movie/MovieCard';
import { Input } from '../ui/input';
import { useDebounce } from '../../hooks/useDebounce';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    // Update URL when query changes
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery });
    } else if (query === '') {
      setSearchParams({});
    }
  }, [debouncedQuery, setSearchParams, query]);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await searchMulti(debouncedQuery);
        // Include people in search results
        const filteredResults = data.results.filter(
          (item: any) => item.media_type === 'movie' || item.media_type === 'tv' || item.media_type === 'person'
        );
        setResults(filteredResults);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto mb-12" style={{ marginBottom: '3rem' }}>
        <h1 className="text-3xl font-bold mb-8 text-center" style={{ marginBottom: '2rem' }}>Search Movies, TV Shows & People</h1>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for titles, people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="!pl-4 pr-12 py-6 text-lg bg-[var(--card)] border-[var(--border)]"
            autoFocus
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] w-5 h-5" />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--brand-primary)]" />
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 py-10">
          {error}
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {results.map((item) => (
            <MovieCard
              key={`${item.media_type}-${item.id}`}
              item={item}
              type={item.media_type}
            />
          ))}
        </div>
      )}

      {!loading && !error && debouncedQuery && results.length === 0 && (
        <div className="text-center py-20 text-[var(--muted-foreground)]">
          No results found for "{debouncedQuery}"
        </div>
      )}

      {!loading && !debouncedQuery && (
        <div className="text-center py-20 text-[var(--muted-foreground)]">
          Type something to start searching
        </div>
      )}
    </div>
  );
}
