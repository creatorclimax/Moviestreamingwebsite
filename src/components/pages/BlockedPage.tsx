import { AlertCircle } from 'lucide-react';

export default function BlockedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-20 h-20 mx-auto mb-6 text-red-500" />
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-[var(--muted-foreground)] mb-6">
          This domain is not authorized to access this service. If you believe this is an error, please contact the administrator.
        </p>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Error Code: <span className="text-[var(--foreground)] font-mono">DOMAIN_NOT_WHITELISTED</span>
          </p>
        </div>
      </div>
    </div>
  );
}
