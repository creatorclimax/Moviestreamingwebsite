import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return `${hours}h ${mins}m`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatYear(dateString: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).getFullYear().toString();
}




/* ================= USER SYNC ================= */

export async function saveUserData(userId: string, data: any) {
  const { error } = await supabase
    .from('user_library')
    .upsert({
      id: userId,
      library: data,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Save user data failed:', error);
  }
}

export async function loadUserData(userId: string) {
  const { data, error } = await supabase
    .from('user_library')
    .select('library')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Load user data failed:', error);
    return null;
  }

  return data?.library || null;
}


export function formatVoteAverage(vote: number): string {
  return vote.toFixed(1);
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Device ID Management for "No Login" Persistence
function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  
  let deviceId = localStorage.getItem('streamflix_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('streamflix_device_id', deviceId);
  }
  return deviceId;
}

const SYNC_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-188c0e85/library`;

async function syncLibrary(type: string, items: any[]) {
  const deviceId = getDeviceId();
  if (!deviceId) return;
  
  try {
    await fetch(`${SYNC_BASE_URL}/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': deviceId
      },
      body: JSON.stringify(items)
    });
  } catch (err) {
    // console.error(`Failed to sync ${type}:`, err);
  }
}

export async function fetchLibrary(type: string): Promise<any[]> {
  const deviceId = getDeviceId();
  if (!deviceId) return [];
  
  try {
    const res = await fetch(`${SYNC_BASE_URL}/${type}`, {
      headers: {
        'x-device-id': deviceId
      }
    });
    
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // console.error(`Failed to fetch ${type}:`, err);
  }
  return [];
}

// Client-side library helpers
export function addToWatchlist(item: any) {
  if (typeof window === 'undefined') return;
  
  const watchlist = getWatchlist();
  const exists = watchlist.find((i: any) => i.id === item.id && i.media_type === item.media_type);
  
  if (!exists) {
    watchlist.push(item);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    syncLibrary('watchlist', watchlist);
  }
}

export function removeFromWatchlist(id: number, mediaType: string) {
  if (typeof window === 'undefined') return;
  
  const watchlist = getWatchlist();
  const filtered = watchlist.filter((i: any) => !(i.id === id && i.media_type === mediaType));
  localStorage.setItem('watchlist', JSON.stringify(filtered));
  syncLibrary('watchlist', filtered);
}

export function getWatchlist(): any[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem('watchlist');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function isInWatchlist(id: number, mediaType: string): boolean {
  const watchlist = getWatchlist();
  return watchlist.some((i: any) => i.id === id && i.media_type === mediaType);
}

export function addToFavorites(item: any) {
  if (typeof window === 'undefined') return;
  
  const favorites = getFavorites();
  const exists = favorites.find((i: any) => i.id === item.id && i.media_type === item.media_type);
  
  if (!exists) {
    favorites.push(item);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    syncLibrary('favorites', favorites);
  }
}

export function removeFromFavorites(id: number, mediaType: string) {
  if (typeof window === 'undefined') return;
  
  const favorites = getFavorites();
  const filtered = favorites.filter((i: any) => !(i.id === id && i.media_type === mediaType));
  localStorage.setItem('favorites', JSON.stringify(filtered));
  syncLibrary('favorites', filtered);
}

export function getFavorites(): any[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem('favorites');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function isInFavorites(id: number, mediaType: string): boolean {
  const favorites = getFavorites();
  return favorites.some((i: any) => i.id === id && i.media_type === mediaType);
}

export function addToHistory(item: any) {
  if (typeof window === 'undefined') return;
  
  const history = getHistory();
  // Remove if already exists
  const filtered = history.filter((i: any) => !(i.id === item.id && i.media_type === item.media_type));
  // Add to beginning
  filtered.unshift({ ...item, watched_at: new Date().toISOString() });
  // Keep only last 100 items
  const trimmed = filtered.slice(0, 100);
  localStorage.setItem('history', JSON.stringify(trimmed));
  syncLibrary('history', trimmed);
}

export function getHistory(): any[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem('history');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToDownloads(item: any) {
  if (typeof window === 'undefined') return;
  
  const downloads = getDownloads();
  // Remove if already exists
  const filtered = downloads.filter((i: any) => !(i.id === item.id && i.media_type === item.media_type));
  // Add to beginning
  filtered.unshift({ ...item, downloaded_at: new Date().toISOString() });
  // Keep only last 100 items
  const trimmed = filtered.slice(0, 100);
  localStorage.setItem('downloads', JSON.stringify(trimmed));
  syncLibrary('downloads', trimmed);
}

export function getDownloads(): any[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem('downloads');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearLibrary() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('watchlist');
  localStorage.removeItem('favorites');
  localStorage.removeItem('history');
  localStorage.removeItem('downloads');
  
  // Sync empty lists
  syncLibrary('watchlist', []);
  syncLibrary('favorites', []);
  syncLibrary('history', []);
  syncLibrary('downloads', []);
}
