import HistoryContent from '../library/HistoryContent';

export default function HistoryPage() {
  return (
    <div className="container mx-auto px-4 py-12 pb-20">
      <h1 className="text-3xl font-bold mb-8">Watch History</h1>
      <HistoryContent />
    </div>
  );
}
