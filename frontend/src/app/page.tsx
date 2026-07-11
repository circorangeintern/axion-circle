export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-800 mb-4">
          🌿 CleanReport
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Community Waste & Sanitation Issue Reporting
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md">
          <p className="text-sm text-green-800">
            ✅ Frontend scaffold ready. Start building!
          </p>
          <p className="text-xs text-gray-500 mt-2">
            API: {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}
          </p>
        </div>
      </div>
    </main>
  );
}
