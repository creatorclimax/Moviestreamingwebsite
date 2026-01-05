'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { getHistory } from '../../lib/utils';
import { getSimilarMovies, getSimilarTV } from '../../lib/tmdb';
import MovieCard from '../movie/MovieCard';

export default function RecommendationsContent() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      const history = getHistory();
      
      if (history.length === 0) {
        setLoading(false);
        return;
      }

      // Take the most recent 5 items
      const recentItems = history.slice(0, 5);
      const recommendationsMap = new Map();
      const processedIds = new Set(history.map((h: any) => h.id)); // Don't recommend what is already watched

      try {
        const promises = recentItems.map(async (item: any) => {
          try {
            if (item.media_type === 'movie') {
              const res = await getSimilarMovies(item.id);
              return res.results.map((m: any) => ({ ...m, media_type: 'movie' }));
            } else if (item.media_type === 'tv') {
              const res = await getSimilarTV(item.id);
              return res.results.map((t: any) => ({ ...t, media_type: 'tv' }));
            }
          } catch (e) {
            console.error(`Failed to fetch similar for ${item.id}`, e);
            return [];
          }
          return [];
        });

        const results = await Promise.all(promises);
        
        // Flatten and process
        results.flat().forEach((item: any) => {
          if (item && !processedIds.has(item.id) && !recommendationsMap.has(item.id)) {
            recommendationsMap.set(item.id, item);
          }
        });

        // Convert to array and simple sort (randomized or by vote)
        // Let's sort by vote average for quality recommendations
        const recommendedItems = Array.from(recommendationsMap.values())
          .sort((a: any, b: any) => b.vote_average - a.vote_average)
          .slice(0, 24); // Limit to 24 items

        setItems(recommendedItems);
      } catch (err) {
        console.error("Error generating recommendations", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  if (loading) {
     return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl" />
            ))}
        </div>
     )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <Sparkles className="w-16 h-16 mx-auto mb-4 text-[var(--muted-foreground)]" />
        <h2 className="text-xl mb-2">No recommendations yet</h2>
        <p className="text-[var(--muted-foreground)]">
          Watch some movies or TV shows to get personalized recommendations
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {items.map((item: any) => (
        <MovieCard
          key={`${item.media_type}-${item.id}`}
          item={item}
          type={item.media_type}
        />
      ))}
    </div>
  );
}
