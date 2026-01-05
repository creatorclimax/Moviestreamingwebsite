import { useState, useEffect } from 'react';
import { Heart, Play } from 'lucide-react';
import {
  addToFavorites,
  removeFromFavorites,
  isInFavorites,
  addToHistory
} from '../../lib/utils';

interface LibraryActionsProps {
  item: any;
  className?: string;
}

export default function LibraryActions({ item, className = '' }: LibraryActionsProps) {
  const [inFavorites, setInFavorites] = useState(false);
  const isMobile = window.innerWidth < 768; // Simple check or just use CSS classes

  useEffect(() => {
    // Check favorites
    setInFavorites(isInFavorites(item.id, item.media_type));
  }, [item]);

  const toggleFavorites = () => {
    if (inFavorites) {
      removeFromFavorites(item.id, item.media_type);
      setInFavorites(false);
    } else {
      addToFavorites(item);
      setInFavorites(true);
    }
  };

  const trailer = item.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');

  const playTrailer = () => {
    if (trailer) {
      window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
    }
  };

  return (
    <div className={`flex gap-3 md:gap-4 ${className}`}>
      {trailer && (
        <button
          onClick={playTrailer}
          className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 md:px-10 h-[58px] rounded-xl transition font-medium text-base backdrop-blur-sm border border-white/10 shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-white/10 hover:bg-white/20 text-white"
        >
          <Play className="w-5 h-5 shrink-0 fill-current" />
          <span className="whitespace-nowrap">Trailer</span>
        </button>
      )}

      
      <button
        onClick={toggleFavorites}
        className={`flex items-center justify-center gap-3 rounded-xl transition font-medium text-base backdrop-blur-sm border border-white/10 shadow-lg hover:shadow-xl hover:-translate-y-0.5 h-[58px] w-[58px] md:w-auto md:px-10 ${
          inFavorites
            ? 'bg-[var(--brand-accent)] text-white'
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
        aria-label={inFavorites ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart className="w-5 h-5 shrink-0" fill={inFavorites ? 'currentColor' : 'none'} />
        <span className="hidden md:inline whitespace-nowrap">
          {inFavorites ? 'Favorited' : 'Favorite'}
        </span>
      </button>
    </div>
  );
}
