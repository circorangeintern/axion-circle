import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import fallbackImage from '../assets/fallback-image.svg';

const timeAgo = (dateStr) => {
  if (!dateStr) return 'Just now';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function ReportListView({ reports }) {
  if (!reports || reports.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#f0ede5] p-6 text-center">
        <p className="text-paragraph font-medium">No reports yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#f0ede5] p-4 sm:p-6 overflow-y-auto space-y-3 z-0">
      {reports.map((report) => {
        const status = (report.status || 'reported').toLowerCase().replace(' ', '');
        const isResolved = status === 'resolved';
        const isInProgress = status === 'inprogress';
        const isAcknowledged = status === 'acknowledged';

        const statusClass = isResolved ? 'bg-alert-successLight text-primary' :
                            isInProgress ? 'bg-alert-inprogressLight text-alert-inprogress' :
                            isAcknowledged ? 'bg-alert-infoLight text-alert-info' :
                            'bg-alert-warningLight text-accent';

        return (
          <div key={report.id} className="bg-white rounded-xl p-4 shadow-sm border border-white-stroke flex flex-col sm:flex-row gap-4 relative">
            {report.photoUrl && (
              <div className="w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden shrink-0">
                <img 
                  src={report.photoUrl} 
                  alt="Thumbnail evidence for report list item" 
                  width="96"
                  height="96"
                  loading="lazy"
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackImage;
                  }}
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ${statusClass}`}>
                    {report.status || 'Reported'}
                  </span>
                  <span className="text-[11px] text-paragraph font-medium whitespace-nowrap">
                    {timeAgo(report.createdAt || report.date)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-black mb-1 leading-tight truncate">
                  {report.title || report.category || 'Sanitation Issue'}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-black-icon mb-2">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    {(report.address || report.areaName || '').includes('Location unavailable') 
                      ? 'Location not automatically captured' 
                      : (report.address || report.areaName || 'Location not captured')}
                  </span>
                </div>
                <p className="text-xs text-paragraph line-clamp-2 leading-relaxed">
                  {report.description}
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <Link
                  to={`/reports/${report.id}`}
                  className="px-4 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[11px] rounded-lg transition-colors"
                >
                  View Report
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
