import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie, TVShow } from '../../lib/types';
import MovieCard from './MovieCard';

interface MovieRowProps {
  title: string;
  items: (Movie | TVShow)[];
  type: 'movie' | 'tv';
  showRank?: boolean;
}

export default function MovieRow({ title, items, type, showRank = false }: MovieRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    const newScrollPosition =
      scrollContainerRef.current.scrollLeft +
      (direction === 'left' ? -scrollAmount : scrollAmount);

    scrollContainerRef.current.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative group">
      {/* Title */}
      <h2 className="mb-6 px-6 md:px-0 text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>

      {/* Scroll Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/70 hover:bg-black/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ml-2"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/70 hover:bg-black/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity mr-2"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Items Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide px-6 md:px-0 !pb-6 pt-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '1.5rem' }}
      >
        {items.map((item, index) => (
          <div key={`${type}-${item.id}`} className="flex-none w-[180px] md:w-[220px]">
            <MovieCard
              item={item}
              type={type}
              rank={showRank ? index + 1 : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
