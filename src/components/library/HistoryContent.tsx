'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getHistory } from '../../lib/utils';
import MovieCard from '../movie/MovieCard';

export default function HistoryContent() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <Clock className="w-16 h-16 mx-auto mb-4 text-[var(--muted-foreground)]" />
        <h2 className="text-xl mb-2">No watch history</h2>
        <p className="text-[var(--muted-foreground)]">
          Your recently watched content will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {items.map((item: any) => (
        <MovieCard
          key={`${item.media_type}-${item.id}-${item.watched_at}`}
          item={item}
          type={item.media_type === 'tv' ? 'tv' : 'movie'}
        />
      ))}
    </div>
  );
}
