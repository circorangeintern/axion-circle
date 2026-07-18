import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-mint/30">
      {/* Header */}
      <header className="bg-brand-primary text-white px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-heading font-bold">CleanReport</h1>
          <p className="text-xs text-white/70">Report It. Track It. Clean It.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification bell placeholder */}
          <button className="relative p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </header>

      {/* Map/List placeholder */}
      <main className="p-4">
        <div className="bg-white rounded-xl shadow-sm border border-brand-primary/10 p-8 text-center">
          <div className="text-4xl mb-3">🗺️</div>
          <h2 className="font-heading font-semibold text-brand-dark text-lg mb-2">Map View Coming Soon</h2>
          <p className="text-sm text-gray-500 mb-4">Reports in your area will appear here as colored pins.</p>
          
          {/* Filter chips preview */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <span className="category-pill category-pill-active">All</span>
            <span className="category-pill">🗑️ Overflow</span>
            <span className="category-pill">🚮 Dumping</span>
            <span className="category-pill">🚿 Blocked</span>
          </div>

          {/* Status legend */}
          <div className="flex justify-center gap-4 text-xs">
            <span className="badge-reported">Reported</span>
            <span className="badge-acknowledged">Acknowledged</span>
            <span className="badge-resolved">Resolved</span>
          </div>
        </div>
      </main>

      {/* FAB - Report button */}
      <Link
        to="/report"
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-primary text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-brand-primary/90 active:scale-95 transition-all"
      >
        +
      </Link>
    </div>
  );
}
