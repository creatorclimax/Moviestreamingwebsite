import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Film, Tv, Home, Bookmark, Heart, Clock, Settings, Layers } from 'lucide-react';
import { BrandingConfig } from '../../lib/types';

interface NavigationProps {
  branding: BrandingConfig;
}

export default function Navigation({ branding }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getLinkClass = (path: string) => {
    const baseClass = "flex items-center gap-3 !px-10 !py-3 text-base font-bold whitespace-nowrap rounded-md transition-all";
    const activeClass = "bg-[var(--brand-primary)] text-white";
    const inactiveClass = "text-[var(--muted-foreground)] hover:!text-[var(--brand-primary)] [&_svg]:transition-colors [&_span]:transition-colors";
    
    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  const getMobileLinkClass = (path: string) => {
    const baseClass = "flex items-center space-x-2 p-2 rounded-md transition";
    const activeClass = "bg-[var(--brand-primary)] text-white";
    const inactiveClass = "text-[var(--muted-foreground)] hover:!text-[var(--brand-primary)]";
    
    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-[var(--card)]/95 backdrop-blur-md border-b border-[var(--border)]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            {branding.logo ? (
              <img src={branding.logo} alt={branding.brandName} className="h-10 w-auto" />
            ) : (
              <span className="text-2xl font-bold text-[var(--brand-primary)] tracking-tight">
                {branding.brandName}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className={getLinkClass('/')}>
              <Home className="w-5 h-5 shrink-0" />
              <span>Home</span>
            </Link>
            <Link to="/movies" className={getLinkClass('/movies')}>
              <Film className="w-5 h-5 shrink-0" />
              <span>Movies</span>
            </Link>
            <Link to="/tv" className={getLinkClass('/tv')}>
              <Tv className="w-5 h-5 shrink-0" />
              <span>TV Series</span>
            </Link>
            <Link to="/collections" className={getLinkClass('/collections')}>
              <Layers className="w-5 h-5 shrink-0" />
              <span>Collections</span>
            </Link>
            <Link to="/library" className={getLinkClass('/library')}>
              <Bookmark className="w-5 h-5 shrink-0" />
              <span>Library</span>
            </Link>
          </div>

          {/* Search and Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hidden md:flex items-center justify-center p-3.5 text-[var(--muted-foreground)] hover:!text-[var(--brand-primary)] rounded-md transition-all"
              aria-label="Search"
            >
              <Search className="w-5 h-5 shrink-0" />
            </button>
            <Link
              to="/settings"
              className="hidden md:flex items-center justify-center p-3.5 text-[var(--muted-foreground)] hover:!text-[var(--brand-primary)] rounded-md transition-all"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 shrink-0" />
            </Link>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-3 text-[var(--muted-foreground)] hover:!text-[var(--brand-primary)] rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[var(--muted-foreground)] hover:!text-[var(--brand-primary)] rounded-full transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="py-4 border-t border-[var(--border)]">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search movies, TV shows, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:opacity-90 transition font-medium"
                style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[var(--border)]">
            <div className="flex flex-col space-y-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className={getMobileLinkClass('/')}>
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link to="/movies" onClick={() => setMobileMenuOpen(false)} className={getMobileLinkClass('/movies')}>
                <Film className="w-4 h-4" />
                <span>Movies</span>
              </Link>
              <Link to="/tv" onClick={() => setMobileMenuOpen(false)} className={getMobileLinkClass('/tv')}>
                <Tv className="w-4 h-4" />
                <span>TV Series</span>
              </Link>
              <Link to="/collections" onClick={() => setMobileMenuOpen(false)} className={getMobileLinkClass('/collections')}>
                <Layers className="w-4 h-4" />
                <span>Collections</span>
              </Link>
              <Link to="/library" onClick={() => setMobileMenuOpen(false)} className={getMobileLinkClass('/library')}>
                <Bookmark className="w-4 h-4" />
                <span>Library</span>
              </Link>
              <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className={getMobileLinkClass('/settings')}>
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
