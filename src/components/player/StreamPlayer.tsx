import { useState, useEffect } from 'react';
import { Server, AlertCircle } from 'lucide-react';
import { STREAM_PROVIDERS, getStreamUrl } from '../../lib/streaming';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface StreamPlayerProps {
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title?: string;
}

export default function StreamPlayer({ tmdbId, type, season, episode, title }: StreamPlayerProps) {
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0);
  const [url, setUrl] = useState('');

  // Reset to first provider when content changes
  useEffect(() => {
    setCurrentProviderIndex(0);
  }, [tmdbId, season, episode]);

  // Update URL whenever provider or content changes
  useEffect(() => {
    const provider = STREAM_PROVIDERS[currentProviderIndex];
    const streamUrl = getStreamUrl(provider.id, type, tmdbId, season, episode);
    setUrl(streamUrl);
  }, [currentProviderIndex, tmdbId, type, season, episode]);

  const handleManualProviderChange = (providerId: string) => {
    const index = STREAM_PROVIDERS.findIndex(p => p.id === providerId);
    if (index !== -1) {
      setCurrentProviderIndex(index);
    }
  };

  return (
    <div id="player-container" className="w-full bg-black rounded-lg overflow-hidden shadow-2xl relative flex flex-col">
      {/* Player Header / Controls - Outside Iframe */}
      <div className="w-full bg-[#111] border-b border-white/10 p-3 flex items-center justify-end z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-[var(--brand-primary)]">
            <AlertCircle className="w-3 h-3" />
            <span className="hidden sm:inline">Playback failed? Switch server here &rarr;</span>
            <span className="sm:hidden">Switch server &rarr;</span>
          </div>

          <div className="flex items-center gap-3">

            
            <Select 
              value={STREAM_PROVIDERS[currentProviderIndex].id} 
              onValueChange={handleManualProviderChange}
            >
              <SelectTrigger className="w-[180px] h-8 bg-[#1a1a1a] border-white/10 text-white text-xs">
                <SelectValue placeholder="Select Source" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                {STREAM_PROVIDERS.map(provider => (
                  <SelectItem 
                    key={provider.id} 
                    value={provider.id}
                    className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer text-xs"
                  >
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Iframe */}
      <div className="relative w-full h-[50vh] min-h-[400px] md:h-auto md:aspect-video bg-black group">
        <iframe
          id="stream-iframe"
          src={url}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
          title={`Stream ${title || 'Video'}`}
        />
      </div>
      
      <div className="bg-[#1a1a1a] p-3 text-center text-xs text-[#525252] hidden">
        If current server fails, please select another source manually.
      </div>
    </div>
  );
}