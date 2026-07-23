import { FileSearch } from 'lucide-react';
import AppNavbar from '../components/AppNavbar';
import { useNavigate } from 'react-router-dom';

export default function ReportDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white-bg font-body flex flex-col">
      <AppNavbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <FileSearch className="w-8 h-8 text-primary" />
        </div>

        {/* Heading */}
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-black mb-3">
          Detailed Report View — Coming Soon
        </h1>

        {/* Subtext */}
        <p className="text-sm sm:text-base text-paragraph max-w-sm leading-relaxed mb-6">
          A dedicated page to view deep statistics and discussions for this individual report will be available soon.
        </p>

        <button
          onClick={() => navigate('/reports')}
          className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold shadow-sm hover:bg-primary/90 transition-colors"
        >
          Return to All Reports
        </button>
      </main>
    </div>
  );
}
