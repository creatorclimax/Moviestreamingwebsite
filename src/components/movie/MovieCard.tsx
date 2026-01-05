import { Link } from 'react-router-dom';
import { Movie, TVShow, Person } from '../../lib/types';
import { getTMDBImageUrl } from '../../lib/tmdb';
import { formatYear } from '../../lib/utils';

interface MovieCardProps {
  item: Movie | TVShow | Person;
  type: 'movie' | 'tv' | 'person';
  rank?: number;
}

export default function MovieCard({ item, type, rank }: MovieCardProps) {
  // Determine the actual media type.
  // If the item has a 'media_type' property (from multi-search or combined lists), use that.
  // Otherwise, fallback to the 'type' prop passed to the component.
  const mediaType = (item as any).media_type || type;

  const isMovie = mediaType === 'movie';
  const isPerson = mediaType === 'person';
  
  // Get the correct title and date based on the type
  let title = '';
  let releaseDate = '';
  let imagePath = null;
  
  if (isPerson) {
    const person = item as Person;
    title = person.name;
    imagePath = person.profile_path;
  } else if (isMovie) {
    const movie = item as Movie;
    title = movie.title;
    releaseDate = movie.release_date;
    imagePath = movie.poster_path;
  } else {
    const tv = item as TVShow;
    title = tv.name;
    releaseDate = tv.first_air_date;
    imagePath = tv.poster_path;
  }
    
  let to = '';
  if (isPerson) {
    to = `/person/${item.id}`;
  } else if (isMovie) {
    to = `/movie/${item.id}`;
  } else {
    to = `/tv/${item.id}`;
  }

  return (
    <Link to={to} className="group relative block transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[var(--muted)] shadow-md group-hover:shadow-xl transition-shadow">
        {/* Rank Badge for Top 10 */}
        {rank !== undefined && (
          <div className="absolute top-0 left-0 z-10 w-14 h-20 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)] flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white drop-shadow-md">{rank}</span>
          </div>
        )}

        {/* Poster/Profile Image */}
        <img
          src={getTMDBImageUrl(imagePath)}
          alt={title || 'Poster'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Overlay - Only for Movies and TV Shows */}
        {!isPerson && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-[var(--brand-accent)] text-sm font-semibold bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
                  ★ {(item as Movie | TVShow).vote_average?.toFixed(1) || 'N/A'}
                </span>
                <span className="text-sm font-medium text-white/90 bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
                  {formatYear(releaseDate)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="mt-4 text-base font-medium leading-snug line-clamp-2 text-gray-200 group-hover:text-[var(--brand-primary)] transition-colors">
        {title}
      </h3>
      {isPerson && (item as Person).known_for_department && (
         <p className="text-sm text-[var(--muted-foreground)] mt-1">
           {(item as Person).known_for_department}
         </p>
      )}
    </Link>
  );
}
