import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from './components/ui/sonner';
import ScrollToTop from './components/layout/ScrollToTop';
import RootLayout from './components/layout/RootLayout';
import HomePage from './components/pages/HomePage';
import MovieDetailsPage from './components/pages/MovieDetailsPage';
import DisclaimerPage from './components/pages/DisclaimerPage';
import PlaceholderPage from './components/pages/PlaceholderPage';
import SettingsPage from './components/pages/SettingsPage';
import ForYouPage from './components/pages/ForYouPage';
import FavoritesPage from './components/pages/FavoritesPage';
import HistoryPage from './components/pages/HistoryPage';
import StreamPage from './components/pages/StreamPage';
import DownloadPage from './components/pages/DownloadPage';
import BlockedPage from './components/pages/BlockedPage';
import MoviesPage from './components/pages/MoviesPage';
import TVPage from './components/pages/TVPage';
import TVDetailsPage from './components/pages/TVDetailsPage';
import SearchPage from './components/pages/SearchPage';
import LibraryPage from './components/pages/LibraryPage';
import CollectionsPage from './components/pages/CollectionsPage';
import CollectionDetailsPage from './components/pages/CollectionDetailsPage';
import PersonDetailsPage from './components/pages/PersonDetailsPage';

export default function App() {
  return (
    <HelmetProvider>
      <Toaster theme="dark" />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
          
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movie/:id" element={<MovieDetailsPage />} />
          
          <Route path="/tv" element={<TVPage />} />
          <Route path="/tv/:id" element={<TVDetailsPage />} />
          
          <Route path="/person/:id" element={<PersonDetailsPage />} />
          
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collection/:id" element={<CollectionDetailsPage />} />
          
          <Route path="/search" element={<SearchPage />} />
          
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/foryou" element={<ForYouPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/history" element={<HistoryPage />} />
          
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          
          <Route path="/stream/:type/:id" element={<StreamPage />} />
          <Route path="/download/:type/:id" element={<DownloadPage />} />
          
          <Route path="/blocked" element={<BlockedPage />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
