import { useState, useEffect } from 'react';
import { Layers, Loader2, Search } from 'lucide-react';
import { getCollection, searchCollections } from '../../lib/tmdb';
import { Collection } from '../../lib/types';
import CollectionCard from '../collection/CollectionCard';
import { Input } from '../ui/input';
import { Pagination } from '../ui/pagination-control';
import { useDebounce } from '../../hooks/useDebounce';

// Curated list of popular collection IDs
const MATRIX_COLLECTION_ID = 2344;
const POPULAR_COLLECTION_IDS = [
  10,      // Star Wars
  86311,   // The Avengers
  1241,    // Harry Potter
  119,     // The Lord of the Rings
  645,     // James Bond
  295,     // Pirates of the Caribbean
  9485,    // The Fast and the Furious
  87359,   // Mission: Impossible
  328,     // Jurassic Park
  131635,  // The Hunger Games
  10194,   // Toy Story
  263,     // The Dark Knight
  MATRIX_COLLECTION_ID, // Matrix
  528,     // Terminator
  230,     // Shrek
  748,     // X-Men
  126125,  // Spider-Man (Original)
  531241,  // The Amazing Spider-Man
  8650,    // Transformers
  2150,    // Indiana Jones
  1575,    // Rocky
  8091,    // Alien
  1570,    // Die Hard
  535313,  // MonsterVerse
  86066,   // Despicable Me
  8354,    // Ice Age
  10594,   // Madagascar
  77816,   // Kung Fu Panda
  89450,   // How to Train Your Dragon
  290823,  // The Conjuring
  3387,    // Saw
  404609,  // John Wick
  2576,    // Bourne
  3257,    // Men in Black
  656,     // Ghostbusters
  264,     // Back to the Future
  121938,  // The Hobbit
  8913,    // Mad Max
  33514,   // Twilight
  173710,  // Planet of the Apes (Original)
  364646,  // Planet of the Apes (Reboot)
  2288,    // Scream
  376,     // Halloween
  2348,    // Friday the 13th
  2883,    // A Nightmare on Elm Street
  8095,    // Child's Play
  9553,    // The Exorcist
  246536,  // Paranormal Activity
  206558,  // Insidious
  254199,  // The Purge
  2575,    // Final Destination
  8872,    // Resident Evil
  2602,    // Underworld
  239527,  // Divergent
  295130,  // The Maze Runner
  535,     // Narnia
  8946,    // Cars
  468222,  // The Incredibles
  126406,  // Finding Nemo
  82432,   // Monsters, Inc.
  8856,    // The Lion King
  386382,  // Frozen
  2190,    // Home Alone
  35560,   // Night at the Museum
  9736,    // Ocean's
  76822,   // The Hangover
  2503,    // Rush Hour
  9706,    // Bad Boys
  2061,    // Lethal Weapon
  2284,    // Beverly Hills Cop
  846,     // Austin Powers
  275069,  // Pitch Perfect
  1726,    // American Pie
  2235,    // Scary Movie
  323067,  // Kingsman
  120601,  // Sherlock Holmes
  6248,    // National Treasure
  1566,    // The Mummy
  263432,  // G.I. Joe
  137682,  // The Expendables
  262337,  // Has Fallen
  108398,  // Taken
  1957,    // The Transporter
  351187,  // Jack Reacher
  302324,  // The Equalizer
  2320,    // The Karate Kid
  558216,  // Venom
  9602,    // Police Academy
  2374,    // Rambo
  422834,  // Annabelle
  1568,    // Gremlins
  2451,    // Blade
  3130,    // Jaws
  556,     // RoboCop
  1653,    // Bill & Ted
  729322,  // Knives Out
  460465,  // Unbreakable / Glass
  127907,  // Paddington
  282,     // The Addams Family
  304,     // Alvin and the Chipmunks
  138,     // Dracula
  2562,    // The Naked Gun
  2355,    // Legally Blonde
  3460,    // Step Up
  10924,   // High School Musical
  115575,  // Magic Mike
  470002,  // Ted
  154,     // Star Trek (Original)
  115,     // Star Trek (Reboot)
  151,     // Star Trek (TNG)
];

const ITEMS_PER_PAGE = 12;

export default function CollectionsPage() {
  const [popularCollections, setPopularCollections] = useState<Collection[]>([]);
  const [searchResults, setSearchResults] = useState<Collection[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(0);
  
  const debouncedQuery = useDebounce(query, 500);

  // Initial fetch of all popular collections
  useEffect(() => {
    let isMounted = true;
    
    const fetchPopular = async () => {
      // Chunking logic to avoid rate limits
      const chunkSize = 5;
      const chunks = [];
      for (let i = 0; i < POPULAR_COLLECTION_IDS.length; i += chunkSize) {
        chunks.push(POPULAR_COLLECTION_IDS.slice(i, i + chunkSize));
      }

      for (let i = 0; i < chunks.length; i++) {
        if (!isMounted) break;

        const chunk = chunks[i];
        const promises = chunk.map(id => 
          getCollection(id).catch(err => {
            console.warn(`Failed to fetch collection ${id}`, err);
            return null;
          })
        );
        
        const results = await Promise.all(promises);
        const validBatch = results.filter((c): c is Collection => c !== null && !!c.id && !!c.poster_path);
        
        if (isMounted && validBatch.length > 0) {
          setPopularCollections(prev => {
            // Avoid duplicates just in case
            const newItems = validBatch.filter(newC => !prev.some(p => p.id === newC.id));
            return [...prev, ...newItems];
          });
          
          // Turn off main loader after first successful batch
          if (i === 0) setLoading(false);
        }

        // Throttle requests
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      if (isMounted) setLoading(false);
    };

    fetchPopular();
    
    return () => { isMounted = false; };
  }, []);

  // Search Effect
  useEffect(() => {
    const performSearch = async () => {
      const isSearch = !!debouncedQuery.trim();
      setIsSearching(isSearch);
      
      if (isSearch) {
        setLoading(true);
        try {
          const data = await searchCollections(debouncedQuery, page);
          setSearchResults(data.results);
          setSearchTotalPages(data.total_pages);
        } catch (error) {
          console.error('Search failed', error);
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        // When switching back to popular, ensure we aren't stuck in loading
        // logic handled by initial fetch, but we might need to reset page?
        // Kept page as shared state, so valid.
      }
    };

    performSearch();
  }, [debouncedQuery, page]);

  // Reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  // Determine what to display
  const displayedCollections = isSearching 
    ? searchResults 
    : popularCollections.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalPages = isSearching 
    ? searchTotalPages 
    : Math.ceil(popularCollections.length / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="mb-8 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Layers className="w-8 h-8 text-[var(--brand-primary)]" />
            <h1 className="text-3xl font-bold">
              {debouncedQuery ? 'Search Results' : 'Popular Collections'}
            </h1>
          </div>
        </div>

        <div className="relative max-w-xl">
          <Input
            type="text"
            placeholder="Search collections..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="!pl-4 pr-12 py-6 text-lg bg-[var(--card)] border-[var(--border)] shadow-sm"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
        </div>
      </div>

      <div className="h-12 w-full" aria-hidden="true" />

      {loading && displayedCollections.length === 0 ? (
        <div className="flex justify-center py-20 min-h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--brand-primary)]" />
        </div>
      ) : (
        <>
          {displayedCollections.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {displayedCollections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-[var(--muted-foreground)]">
              {isSearching ? 'No collections found.' : 'Loading popular collections...'}
            </div>
          )}

          {totalPages > 1 && (
            <>
              <div className="h-12 w-full" aria-hidden="true" />
              <Pagination 
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                maxPage={50}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
