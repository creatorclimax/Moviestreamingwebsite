import { StreamProvider } from './types';

// 6 switchable streaming providers
export const STREAM_PROVIDERS: StreamProvider[] = [
  {
    id: 'vidsrc-embed',
    name: 'Server 1',
    baseUrl: 'https://vidsrc-embed.ru/embed',
    requiresType: true
  },
  {
    id: 'vidsrc-cc',
    name: 'Server 2',
    baseUrl: 'https://vidsrc.cc/v2/embed',
    requiresType: true
  },
  {
    id: 'vidlink',
    name: 'Server 3',
    baseUrl: 'https://vidlink.pro',
    requiresType: true
  },
  {
    id: 'vidrock',
    name: 'Server 4',
    baseUrl: 'https://vidrock.net',
    requiresType: true
  },
  {
    id: 'autoembed',
    name: 'Server 5',
    baseUrl: 'https://player.autoembed.cc/embed',
    requiresType: true
  },
  {
    id: 'multiembed',
    name: 'Server 6',
    baseUrl: 'https://multiembed.mov',
    requiresType: false
  }
];

export function getStreamUrl(
  providerId: string,
  type: 'movie' | 'tv',
  tmdbId: number,
  season?: number,
  episode?: number
): string {
  const provider = STREAM_PROVIDERS.find(p => p.id === providerId);
  
  if (!provider) {
    return '';
  }
  
  // Specific handling for MultiEmbed
  if (provider.id === 'multiembed') {
     const url = new URL(provider.baseUrl);
     url.searchParams.set('video_id', tmdbId.toString());
     url.searchParams.set('tmdb', '1');
     
     if (type === 'tv' && season !== undefined && episode !== undefined) {
       url.searchParams.set('s', season.toString());
       url.searchParams.set('e', episode.toString());
     }
     
     return url.toString();
  }
  
  if (provider.requiresType) {
    // Format: baseUrl/type/tmdbId or baseUrl/type/tmdbId/season/episode
    if (type === 'tv' && season !== undefined && episode !== undefined) {
      return `${provider.baseUrl}/${type}/${tmdbId}/${season}/${episode}`;
    }
    return `${provider.baseUrl}/${type}/${tmdbId}`;
  } else {
    // Fallback logic for other query-based providers if added later
    const url = new URL(provider.baseUrl);
    url.searchParams.set('tmdb', tmdbId.toString());
    
    if (type === 'tv' && season !== undefined && episode !== undefined) {
      url.searchParams.set('s', season.toString());
      url.searchParams.set('e', episode.toString());
    }
    
    return url.toString();
  }
}

// Download provider
export function getDownloadUrl(
  type: 'movie' | 'tv',
  tmdbId: number,
  season?: number,
  episode?: number
): string {
  const baseUrl = 'https://dl.vidsrc.vip';
  
  if (type === 'tv') {
    if (season !== undefined && episode !== undefined) {
      return `${baseUrl}/tv/${tmdbId}/${season}/${episode}`;
    }
    return `${baseUrl}/tv/${tmdbId}`;
  }
  
  return `${baseUrl}/movie/${tmdbId}`;
}
