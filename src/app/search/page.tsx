import { Metadata } from 'next';
import { Suspense } from 'react';
import SearchResults from '@/components/search/SearchResults';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search for movies and TV shows.',
};

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-12 pb-20">
      <h1 className="mb-8">Search</h1>
      
      <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
