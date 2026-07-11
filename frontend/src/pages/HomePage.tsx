export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-primary text-white p-4">
        <h1 className="text-xl font-bold">🌿 CleanReport</h1>
        <p className="text-sm text-green-100">Community Waste & Sanitation Reporting</p>
      </header>
      <main className="p-4">
        <p className="text-gray-600">Map/List view of reports goes here.</p>
        {/* TODO: Leaflet map + report markers */}
        {/* TODO: Filter by category/status */}
        {/* TODO: List view toggle */}
      </main>
    </div>
  );
}
