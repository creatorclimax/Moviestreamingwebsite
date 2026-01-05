import { useState, useEffect } from 'react';
import { getTVDetails, getSeasonDetails } from '../../lib/tmdb';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface SeasonEpisodeSelectorProps {
  tmdbId: number;
  currentSeason: number;
  currentEpisode: number;
  onSelect: (season: number, episode: number) => void;
  variant?: 'default' | 'outline';
}

export default function SeasonEpisodeSelector({ 
  tmdbId, 
  currentSeason, 
  currentEpisode, 
  onSelect,
  variant = 'default'
}: SeasonEpisodeSelectorProps) {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loadingSeasons, setLoadingSeasons] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Fetch TV details to get seasons
  useEffect(() => {
    const fetchTV = async () => {
      try {
        const data = await getTVDetails(tmdbId);
        const validSeasons = data.seasons?.filter((s: any) => s.season_number > 0) || [];
        setSeasons(validSeasons);
      } catch (error) {
        console.error('Failed to fetch TV details:', error);
      } finally {
        setLoadingSeasons(false);
      }
    };

    fetchTV();
  }, [tmdbId]);

  // Fetch episodes for the current season
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!currentSeason) return;
      setLoadingEpisodes(true);
      
      try {
        const data = await getSeasonDetails(tmdbId, currentSeason);
        setEpisodes(data.episodes || []);
      } catch (error) {
        console.error('Failed to fetch season details:', error);
      } finally {
        setLoadingEpisodes(false);
      }
    };

    fetchEpisodes();
  }, [tmdbId, currentSeason]);

  if (loadingSeasons) {
    return (
      <div className="flex gap-4">
        <div className="h-10 w-32 bg-[var(--muted)] animate-pulse rounded-md" />
        <div className="h-10 w-48 bg-[var(--muted)] animate-pulse rounded-md" />
      </div>
    );
  }

  if (seasons.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select
        value={currentSeason.toString()}
        onValueChange={(val) => onSelect(parseInt(val), 1)}
      >
        <SelectTrigger className="w-[140px] bg-[#1a1a1a] border-white/10 text-white h-12">
          <SelectValue placeholder="Season" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white max-h-[300px]">
          {seasons.map((season) => (
            <SelectItem 
              key={season.id} 
              value={season.season_number.toString()}
              className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
            >
              Season {season.season_number}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentEpisode.toString()}
        onValueChange={(val) => onSelect(currentSeason, parseInt(val))}
        disabled={loadingEpisodes}
      >
        <SelectTrigger className="w-[240px] bg-[#1a1a1a] border-white/10 text-white h-12">
          <SelectValue placeholder={loadingEpisodes ? "Loading..." : "Episode"} />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white max-h-[300px]">
          {episodes.map((episode) => (
            <SelectItem 
              key={episode.id} 
              value={episode.episode_number.toString()}
              className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
            >
              E{episode.episode_number} - {episode.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
