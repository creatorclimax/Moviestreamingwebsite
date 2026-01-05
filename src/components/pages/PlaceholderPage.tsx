import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-[var(--muted-foreground)] mb-8 max-w-md">
        This page is under construction. Features are being implemented.
      </p>
      <Link 
        to="/"
        className="px-6 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:opacity-90 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}
