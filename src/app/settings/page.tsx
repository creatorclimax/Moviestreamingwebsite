import { Metadata } from 'next';
import SettingsContent from '@/components/settings/SettingsContent';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your preferences and settings.',
};

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-12 pb-20">
      <h1 className="mb-8">Settings</h1>
      <SettingsContent />
    </div>
  );
}
