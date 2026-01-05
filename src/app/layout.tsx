import type { Metadata } from 'next';
import { getBrandingConfig, getThemeStyles } from '@/lib/tenant';
import Navigation from '@/components/navigation/Navigation';
import '@/styles/globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingConfig();
  
  return {
    title: {
      template: `%s | ${branding.brandName}`,
      default: `${branding.brandName} - Stream Movies & TV Shows`
    },
    description: `Watch unlimited movies and TV shows on ${branding.brandName}. Stream the latest releases and timeless classics.`,
    icons: {
      icon: branding.favicon || '/favicon.ico'
    },
    openGraph: {
      type: 'website',
      title: `${branding.brandName} - Stream Movies & TV Shows`,
      description: `Watch unlimited movies and TV shows on ${branding.brandName}.`,
      images: ['/og-image.png']
    },
    twitter: {
      card: 'summary_large_image',
      title: `${branding.brandName} - Stream Movies & TV Shows`,
      description: `Watch unlimited movies and TV shows on ${branding.brandName}.`,
      images: ['/og-image.png']
    }
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branding = await getBrandingConfig();
  const themeStyles = getThemeStyles(branding);
  
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      </head>
      <body>
        <Navigation branding={branding} />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-[var(--card)] border-t border-[var(--border)] py-12 mt-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h4 className="mb-4">{branding.brandName}</h4>
                <p className="text-[var(--muted-foreground)] text-sm">
                  Your ultimate destination for movies and TV shows.
                </p>
              </div>
              <div>
                <h4 className="mb-4 text-sm">Browse</h4>
                <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                  <li><a href="/movies" className="hover:text-[var(--brand-primary)]">Movies</a></li>
                  <li><a href="/tv" className="hover:text-[var(--brand-primary)]">TV Series</a></li>
                  <li><a href="/search" className="hover:text-[var(--brand-primary)]">Search</a></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm">Library</h4>
                <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                  <li><a href="/watchlist" className="hover:text-[var(--brand-primary)]">Watchlist</a></li>
                  <li><a href="/favorites" className="hover:text-[var(--brand-primary)]">Favorites</a></li>
                  <li><a href="/history" className="hover:text-[var(--brand-primary)]">Watch History</a></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm">Support</h4>
                <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                  <li><a href="/disclaimer" className="hover:text-[var(--brand-primary)]">Disclaimer</a></li>
                  <li><a href="/contact" className="hover:text-[var(--brand-primary)]">Contact Us</a></li>
                  <li><a href="/settings" className="hover:text-[var(--brand-primary)]">Settings</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--muted-foreground)]">
              <p>&copy; {new Date().getFullYear()} {branding.brandName}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
