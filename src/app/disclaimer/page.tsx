import { Metadata } from 'next';
import { AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Important information and disclaimers.',
};

export default function DisclaimerPage() {
  return (
    <div className="container mx-auto px-4 py-12 pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <AlertCircle className="w-8 h-8 text-[var(--brand-accent)]" />
          <h1>Disclaimer</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-6">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <h2 className="text-xl mb-4">Content Notice</h2>
            <p className="text-[var(--muted-foreground)] mb-4">
              This website provides access to third-party streaming and download services. We do not host, store, or distribute any video content ourselves.
            </p>
            <p className="text-[var(--muted-foreground)]">
              All content is sourced from external providers and we are not responsible for the availability, quality, or legality of such content.
            </p>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <h2 className="text-xl mb-4">Copyright & Legal</h2>
            <p className="text-[var(--muted-foreground)] mb-4">
              All movie and TV show information, including posters, backdrops, and metadata, is provided by The Movie Database (TMDB) and is for informational purposes only.
            </p>
            <p className="text-[var(--muted-foreground)] mb-4">
              Users are responsible for ensuring they have the necessary rights and permissions to access content in their region.
            </p>
            <p className="text-[var(--muted-foreground)]">
              We respect copyright laws and will respond to valid DMCA takedown requests.
            </p>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <h2 className="text-xl mb-4">Third-Party Services</h2>
            <p className="text-[var(--muted-foreground)] mb-4">
              Streaming and download services are provided by third parties. We do not control these services and are not responsible for their content, privacy practices, or availability.
            </p>
            <p className="text-[var(--muted-foreground)]">
              Use of third-party services is at your own risk and subject to their respective terms of service.
            </p>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <h2 className="text-xl mb-4">Privacy & Data</h2>
            <p className="text-[var(--muted-foreground)] mb-4">
              Your watchlist, favorites, and watch history are stored locally in your browser and are not sent to our servers.
            </p>
            <p className="text-[var(--muted-foreground)]">
              We do not collect or store any personal information about our users.
            </p>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <h2 className="text-xl mb-4">Use at Your Own Risk</h2>
            <p className="text-[var(--muted-foreground)]">
              This website is provided &quot;as is&quot; without any warranties. We are not liable for any damages arising from the use of this website or third-party services accessed through it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
