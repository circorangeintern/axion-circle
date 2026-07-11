import { useParams } from 'react-router-dom';

export default function ReportDetailPage() {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold">Report Detail</h1>
      <p className="text-gray-600">Report ID: {id}</p>
      {/* TODO: Photo display */}
      {/* TODO: Status badge + timeline */}
      {/* TODO: Location map pin */}
      {/* TODO: WhatsApp share button */}
    </div>
  );
}
