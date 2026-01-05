import { Link } from 'react-router-dom';
import { Collection } from '../../lib/types';
import { getTMDBImageUrl } from '../../lib/tmdb';

interface CollectionCardProps {
  collection: Collection;
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link to={`/collection/${collection.id}`} className="group relative block transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[var(--muted)] shadow-md group-hover:shadow-xl transition-shadow">
        {/* Poster Image */}
        <img
          src={getTMDBImageUrl(collection.poster_path)}
          alt={collection.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <span className="text-sm font-medium text-white/90 bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
              View Collection
            </span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-4 text-base font-medium leading-snug line-clamp-2 text-gray-200 group-hover:text-[var(--brand-primary)] transition-colors">
        {collection.name}
      </h3>
    </Link>
  );
}
