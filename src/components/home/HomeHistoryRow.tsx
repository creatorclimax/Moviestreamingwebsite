import { useState, useEffect } from 'react';
import { getHistory } from '../../lib/utils';
import MovieRow from '../movie/MovieRow';

export default function HomeHistoryRow() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    // Get history and reverse it to show most recent first (getHistory usually returns in order added or we should check)
    // getHistory implementation usually returns array. Let's assume it's sorted or we sort it.
    // If getHistory returns what is in localStorage, and we push to end, we should reverse.
    const history = getHistory().reverse(); 
    setItems(history.slice(0, 20)); 
  }, []);

  if (items.length === 0) return null;

  return (
    <MovieRow
      title="Continue Watching"
      items={items}
      type="movie" 
    />
  );
}
