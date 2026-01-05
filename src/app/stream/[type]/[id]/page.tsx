'use client';

import { useState, use } from 'react';
import { STREAM_PROVIDERS, getStreamUrl } from '@/lib/streaming';

interface StreamPageProps {
  params: Promise<{ type: string; id: string }>;
}

export default function StreamPage({ params }: StreamPageProps) {
  const resolvedParams = use(params);
  const { type, id } = resolvedParams;
  const [selectedProvider, setSelectedProvider] = useState(STREAM_PROVIDERS[0].id);
  const [season, setSeason] = useState<number>(1);
  const [episode, setEpisode] = useState<number>(1);

  const isTV = type === 'tv';
  const streamUrl = getStreamUrl(
    selectedProvider,
    type as 'movie' | 'tv',
    parseInt(id),
    isTV ? season : undefined,
    isTV ? episode : undefined
  );

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Provider Selector */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {STREAM_PROVIDERS.map(provider => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedProvider === provider.id
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'bg-[var(--muted)] hover:bg-[var(--border)]'
                }`}
              >
                {provider.name}
              </button>
            ))}
          </div>

          {/* TV Episode Selector */}
          {isTV && (
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <label htmlFor="season" className="text-sm">Season:</label>
                <select
                  id="season"
                  value={season}
                  onChange={(e) => setSeason(parseInt(e.target.value))}
                  className="px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(s => (
                    <option key={s} value={s}>Season {s}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="episode" className="text-sm">Episode:</label>
                <select
                  id="episode"
                  value={episode}
                  onChange={(e) => setEpisode(parseInt(e.target.value))}
                  className="px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                >
                  {Array.from({ length: 24 }, (_, i) => i + 1).map(e => (
                    <option key={e} value={e}>Episode {e}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Stream Player */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={streamUrl}
            className="absolute inset-0 w-full h-full rounded-lg"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
          />
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-[var(--muted-foreground)]">
          <p className="text-sm">
            Currently streaming with {STREAM_PROVIDERS.find(p => p.id === selectedProvider)?.name}
          </p>
          <p className="text-xs mt-2">
            If the video doesn&apos;t load, try switching to a different provider above.
          </p>
        </div>
      </div>
    </div>
  );
}
