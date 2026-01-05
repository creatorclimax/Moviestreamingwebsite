import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Loader2 } from 'lucide-react';
import { getPersonDetails } from '../../lib/tmdb';
import { getTMDBImageUrl, getTMDBBackdropUrl } from '../../lib/tmdb';
import { formatDate } from '../../lib/utils';
import MovieCard from '../movie/MovieCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import Seo from '../seo/Seo';
import ShareButton from '../common/ShareButton';

export default function PersonDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      setError(false);
      
      try {
        const numericId = parseInt(id);
        const personData = await getPersonDetails(numericId);
        
        // Sort credits by popularity and then release date
        if (personData.combined_credits) {
          const sortCredits = (credits: any[]) => {
            return credits.sort((a, b) => {
              // Primary sort: Popularity
              const popDiff = (b.popularity || 0) - (a.popularity || 0);
              if (Math.abs(popDiff) > 5) return popDiff;
              
              // Secondary sort: Release Date
              const dateA = new Date(a.release_date || a.first_air_date || '0').getTime();
              const dateB = new Date(b.release_date || b.first_air_date || '0').getTime();
              return dateB - dateA;
            });
          };

          personData.combined_credits.cast = sortCredits(personData.combined_credits.cast);
          personData.combined_credits.crew = sortCredits(personData.combined_credits.crew);
        }

        setData(personData);
      } catch (e) {
        console.error("Failed to fetch person details", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--brand-primary)]" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="min-h-screen pt-20 flex items-center justify-center">Person not found</div>;
  }

  // Find a backdrop from their best known work if available, or just use a dark gradient
  const bestWork = data.combined_credits?.cast?.[0] || data.combined_credits?.crew?.[0];
  const backdropPath = bestWork?.backdrop_path;

  return (
    <div className="pb-20">
      <Seo 
        title={data.name} 
        description={data.biography} 
        image={data.profile_path}
        type="profile"
      />
       {/* Hero Section */}
       <div className="relative w-full min-h-[50vh] flex flex-col">
        
        {/* Background Image (derived from top credit) */}
        <div className="absolute inset-0">
          {backdropPath && (
            <img
              src={getTMDBBackdropUrl(backdropPath, 'original')}
              alt=""
              className="w-full h-full object-cover opacity-30 blur-sm"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/80 to-transparent" />
        </div>

        {/* Back Button */}
        <div className="relative z-40 container mx-auto px-4 pt-14 pointer-events-none">
          <button 
            onClick={() => navigate(-1)}
            className="pointer-events-auto flex items-center gap-2 text-white/80 hover:text-[var(--brand-primary)] transition-colors px-4 py-2 rounded-lg -ml-4 backdrop-blur-sm"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="text-lg">Back</span>
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 md:px-8 pt-10 pb-10">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Profile Image */}
            <div className="flex-none w-48 md:w-64 mx-auto md:mx-0">
              <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[var(--card)]">
                <img
                  src={getTMDBImageUrl(data.profile_path, 'w500')}
                  alt={data.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{data.name}</h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8 text-[var(--muted-foreground)]">
                {data.birthday && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Born: {formatDate(data.birthday)}</span>
                    {data.deathday && <span>- Died: {formatDate(data.deathday)}</span>}
                  </div>
                )}
                {data.place_of_birth && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{data.place_of_birth}</span>
                  </div>
                )}
              </div>
              
              <div className="mb-8">
                <ShareButton 
                    type="person" 
                    id={data.id} 
                    title={data.name}
                    className="!w-12 !h-12 !rounded-lg"
                />
              </div>

              {data.biography && (
                <div className="max-w-4xl">
                  <h2 className="text-xl font-semibold mb-2">Biography</h2>
                  <p className="text-[var(--muted-foreground)] leading-relaxed whitespace-pre-wrap">
                    {data.biography || "No biography available."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Credits Section */}
      <div className="container mx-auto px-4 mt-8">
        <Tabs defaultValue="cast" className="w-full">
          <TabsList className="bg-[var(--card)] border border-[var(--border)] mb-8">
            <TabsTrigger value="cast" disabled={!data.combined_credits?.cast?.length}>
              Acting ({data.combined_credits?.cast?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="crew" disabled={!data.combined_credits?.crew?.length}>
              Production ({data.combined_credits?.crew?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cast">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {data.combined_credits?.cast?.map((item: any, index: number) => (
                <MovieCard
                  key={`cast-${item.media_type}-${item.id}-${index}`}
                  item={item}
                  type={item.media_type}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="crew">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {data.combined_credits?.crew?.map((item: any, index: number) => (
                 <MovieCard
                  key={`crew-${item.media_type}-${item.id}-${item.job}-${index}`}
                  item={item}
                  type={item.media_type}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
