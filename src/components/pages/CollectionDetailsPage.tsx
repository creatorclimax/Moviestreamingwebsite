import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { getCollection, getTMDBBackdropUrl } from '../../lib/tmdb';
import { Collection, Movie } from '../../lib/types';
import MovieCard from '../movie/MovieCard';
import Seo from '../seo/Seo';
import ShareButton from '../common/ShareButton';

export default function CollectionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollection = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await getCollection(parseInt(id));
        if (!data) {
          setError('Collection not found.');
          return;
        }
        setCollection(data);
      } catch (err) {
        console.error('Failed to fetch collection details', err);
        setError('Failed to load collection details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20 min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--brand-primary)]" />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-screen text-center">
        <p className="text-xl text-[var(--muted-foreground)] mb-4">{error || 'Collection not found'}</p>
        <Link to="/collections" className="text-[var(--brand-primary)] hover:underline">
          Back to Collections
        </Link>
      </div>
    );
  }

  // Sort parts by release date
  const sortedParts = collection.parts?.sort((a, b) => {
    if (!a.release_date) return 1;
    if (!b.release_date) return -1;
    return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
  }) || [];

  return (
    <div className="min-h-screen">
      <Seo 
        title={collection.name} 
        description={collection.overview} 
        image={collection.poster_path || collection.backdrop_path}
      />
      {/* Hero Header */}
      <div className="relative w-full min-h-[60vh] flex flex-col justify-end">
        
        {/* Back Button Container */}
        <div className="absolute left-0 right-0 bottom-0 top-8 pointer-events-none z-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <button 
                onClick={() => navigate(-1)}
                className="pointer-events-auto flex items-center gap-2 text-white/80 hover:text-[var(--brand-primary)] transition-colors px-4 py-2 rounded-lg -ml-4 backdrop-blur-sm"
              >
                <ArrowLeft className="w-6 h-6" />
                <span className="text-lg">Back</span>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 z-0">
          <img
            src={getTMDBBackdropUrl(collection.backdrop_path, 'original')}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/60 to-transparent" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pb-10 pt-32">
          <div className="w-full">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              {collection.name}
            </h1>
            
            {collection.overview && (
              <p className="text-lg text-gray-200 drop-shadow-md leading-relaxed !mb-2">
                {collection.overview}
              </p>
            )}
            
            <div className="mt-6">
              <ShareButton 
                  type="collection" 
                  id={collection.id} 
                  title={collection.name}
                  className="!w-12 !h-12 !rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to guarantee separation */}
      <div className="w-full h-8"></div>

      {/* Movies Grid */}
      <div className="container mx-auto px-4 !pt-1 pb-20 relative z-10">
        <h2 className="text-3xl font-bold !mb-6">Movies in this Collection</h2>
        
        {sortedParts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {sortedParts.map((movie) => (
              <MovieCard 
                key={movie.id} 
                item={movie} 
                type="movie" 
              />
            ))}
          </div>
        ) : (
          <p className="text-[var(--muted-foreground)]">No movies available in this collection.</p>
        )}
      </div>
    </div>
  );
}
