'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import MovieCard from '@/components/movie/MovieCard';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, you would call your API route here
      // For now, we'll use a placeholder
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(q)}`
      ).catch(() => ({ ok: false }));

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for movies, TV shows..."
            className="w-full px-6 py-4 bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] pr-12"
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--brand-primary)]"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-[var(--muted-foreground)]">Searching...</p>
        </div>
      ) : results.length > 0 ? (
        <div>
          <h2 className="mb-6">Search Results for &quot;{query}&quot;</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {results.map((item: any) => (
              <MovieCard
                key={`${item.media_type}-${item.id}`}
                item={item}
                type={item.media_type === 'tv' ? 'tv' : 'movie'}
              />
            ))}
          </div>
        </div>
      ) : query ? (
        <div className="text-center py-12">
          <p className="text-[var(--muted-foreground)]">
            No results found for &quot;{query}&quot;
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <p className="text-[var(--muted-foreground)]">
            Enter a search term to find movies and TV shows
          </p>
        </div>
      )}
    </div>
  );
}
