'use client';

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { getDownloads } from '../../lib/utils';
import MovieCard from '../movie/MovieCard';

export default function DownloadsContent() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    setItems(getDownloads());
  }, []);

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <Download className="w-16 h-16 mx-auto mb-4 text-[var(--muted-foreground)]" />
        <h2 className="text-xl mb-2">No download history</h2>
        <p className="text-[var(--muted-foreground)]">
          Movies and TV shows you download will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {items.map((item: any) => (
        <MovieCard
          key={`${item.media_type}-${item.id}-${item.downloaded_at}`}
          item={item}
          type={item.media_type === 'tv' ? 'tv' : 'movie'}
        />
      ))}
    </div>
  );
}
