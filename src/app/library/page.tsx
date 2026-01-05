import { Metadata } from 'next';
import Link from 'next/link';
import { Bookmark, Heart, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Library',
  description: 'Access your watchlist, favorites, and watch history.',
};

export default function LibraryPage() {
  return (
    <div className="container mx-auto px-4 py-12 pb-20">
      <h1 className="mb-8">My Library</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Watchlist */}
        <Link
          href="/watchlist"
          className="group bg-[var(--card)] border border-[var(--border)] rounded-lg p-8 hover:border-[var(--brand-primary)] transition"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--brand-primary)]/20 transition">
              <Bookmark className="w-8 h-8 text-[var(--brand-primary)]" />
            </div>
            <h2 className="text-xl mb-2">Watchlist</h2>
            <p className="text-[var(--muted-foreground)] text-sm">
              Movies and shows you want to watch
            </p>
          </div>
        </Link>

        {/* Favorites */}
        <Link
          href="/favorites"
          className="group bg-[var(--card)] border border-[var(--border)] rounded-lg p-8 hover:border-[var(--brand-accent)] transition"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--brand-accent)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--brand-accent)]/20 transition">
              <Heart className="w-8 h-8 text-[var(--brand-accent)]" />
            </div>
            <h2 className="text-xl mb-2">Favorites</h2>
            <p className="text-[var(--muted-foreground)] text-sm">
              Your all-time favorite content
            </p>
          </div>
        </Link>

        {/* History */}
        <Link
          href="/history"
          className="group bg-[var(--card)] border border-[var(--border)] rounded-lg p-8 hover:border-[var(--info)] transition"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--info)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--info)]/20 transition">
              <Clock className="w-8 h-8 text-[var(--info)]" />
            </div>
            <h2 className="text-xl mb-2">Watch History</h2>
            <p className="text-[var(--muted-foreground)] text-sm">
              Recently watched content
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
