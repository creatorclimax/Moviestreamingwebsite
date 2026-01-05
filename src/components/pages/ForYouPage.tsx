import RecommendationsContent from '../library/RecommendationsContent';

export default function ForYouPage() {
  return (
    <div className="container mx-auto px-4 py-12 pb-20">
      <h1 className="text-3xl font-bold mb-8">For You</h1>
      <RecommendationsContent />
    </div>
  );
}
