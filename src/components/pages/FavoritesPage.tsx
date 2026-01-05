import FavoritesContent from '../library/FavoritesContent';

export default function FavoritesPage() {
  return (
    <div className="container mx-auto px-4 py-12 pb-20">
      <h1 className="text-3xl font-bold mb-8">Favorites</h1>
      <FavoritesContent />
    </div>
  );
}
