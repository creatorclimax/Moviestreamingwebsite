import { useState, useEffect } from 'react';
import { getHistory } from '../../lib/utils';
import { getSimilarMovies, getSimilarTV } from '../../lib/tmdb';
import MovieRow from '../movie/MovieRow';

export default function HomeRecommendationsRow() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      const history = getHistory(); // Most recent usually at the end? Or beginning? getHistory usually returns simple array.
      // Assuming simple array from localstorage.
      // We want most recent.
      const recentItems = [...history].reverse().slice(0, 5);
      
      if (recentItems.length === 0) {
        setLoading(false);
        return;
      }

      const recommendationsMap = new Map();
      const processedIds = new Set(history.map((h: any) => h.id));

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
        
        results.flat().forEach((item: any) => {
          if (item && !processedIds.has(item.id) && !recommendationsMap.has(item.id)) {
            recommendationsMap.set(item.id, item);
          }
        });

        const recommendedItems = Array.from(recommendationsMap.values())
          .sort((a: any, b: any) => b.vote_average - a.vote_average)
          .slice(0, 20);

        setItems(recommendedItems);
      } catch (err) {
        console.error("Error generating recommendations", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <MovieRow
      title="For You"
      items={items}
      type="movie"
    />
  );
}
