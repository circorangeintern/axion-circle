import { Shield } from 'lucide-react';
import AppNavbar from '../components/AppNavbar';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-white-bg font-body flex flex-col">
      <AppNavbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Shield className="w-8 h-8 text-primary" />
        </div>

        {/* Heading */}
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-black mb-3">
          Admin Dashboard — Coming Soon
        </h1>

        {/* Subtext */}
        <p className="text-sm sm:text-base text-paragraph max-w-sm leading-relaxed">
          Administrative controls and community oversight tools will be available here soon.
        </p>
      </main>
    </div>
  );
}
