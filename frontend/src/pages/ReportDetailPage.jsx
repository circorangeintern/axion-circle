import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, AlertTriangle, Share2, User, CheckCircle2, Circle } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AppNavbar from '../components/AppNavbar';
import { initialReportsData, getCardPhotoUrl } from './ReportsPage';

// Icon generation for map
const getMarkerIcon = (status) => {
  const s = (status || 'reported').toLowerCase().replace(' ', '');
  let bg = 'bg-status-reported';
  if (s === 'acknowledged') bg = 'bg-status-acknowledged';
  else if (s === 'inprogress') bg = 'bg-status-inprogress';
  else if (s === 'resolved') bg = 'bg-status-resolved';

  return L.divIcon({
    html: `<div class="w-4 h-4 ${bg} border-2 border-white rounded-full shadow-md"></div>`,
    className: 'custom-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const getStatusBadgeStyle = (status) => {
  const s = status.toLowerCase();
  if (s === 'reported') return 'bg-status-reported/15 text-status-reported border-status-reported/30';
  if (s === 'in progress') return 'bg-status-inprogress/15 text-status-inprogress border-status-inprogress/30';
  if (s === 'resolved') return 'bg-status-resolved/15 text-status-resolved border-status-resolved/30';
  if (s === 'acknowledged') return 'bg-status-acknowledged/15 text-status-acknowledged border-status-acknowledged/30';
  return 'bg-white-bg2 text-paragraph border-white-stroke';
};

const timelineSteps = ['Reported', 'Acknowledged', 'In Progress', 'Resolved'];

export default function ReportDetailPage() {
  const { id } = useParams();
  
  // Find report or fallback to first
  let report = initialReportsData.find(r => r.id === Number(id));
  if (!report) report = initialReportsData[0];

  // Generate deterministic coordinates based on ID
  const idx = Number(id) || 1;
  const lat = 6.5244 + (Math.sin(idx * 2.5) * 0.08);
  const lng = 3.3792 + (Math.cos(idx * 2.5) * 0.08);

  const currentStepIndex = timelineSteps.findIndex(s => s.toLowerCase() === report.status.toLowerCase());

  return (
    <div className="min-h-screen bg-white-bg sm:bg-white font-body flex flex-col justify-between relative">
      <div>
        <AppNavbar activeTab="reports" />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* Header */}
          <div className="mb-8">
            <Link to="/reports" className="inline-flex items-center gap-2 text-sm font-semibold text-paragraph hover:text-black transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Reports
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="font-heading text-[28px] sm:text-[32px] font-semibold text-black leading-tight mb-2">
                  {report.title}
                </h1>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeStyle(report.status)}`}>
                    {report.status}
                  </span>
                  <span className="text-xs text-paragraph font-medium">Ref: CR-{String(report.id).padStart(4, '0')}</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-xl flex items-center justify-center gap-2 font-semibold text-sm w-full sm:w-auto shrink-0 shadow-2xs active:scale-95">
                <Share2 className="w-4 h-4" /> Share on WhatsApp
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Viewer */}
              <div className="w-full h-64 sm:h-[400px] rounded-2xl overflow-hidden shadow-sm border border-white-stroke bg-white-bg">
                <img src={getCardPhotoUrl(report)} alt={report.title} className="w-full h-full object-cover" />
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-white-stroke p-6 shadow-2xs">
                <h2 className="text-lg font-bold text-black mb-3">Description</h2>
                <p className="text-sm sm:text-base text-paragraph leading-relaxed">
                  {report.description}
                </p>
              </div>

              {/* Location Mini Map */}
              <div className="bg-white rounded-2xl border border-white-stroke p-6 shadow-2xs">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-black">Location</h2>
                </div>
                <p className="text-sm text-paragraph mb-4 font-medium">{report.address}</p>
                <div className="w-full h-48 rounded-xl overflow-hidden border border-white-stroke z-0 relative">
                  <MapContainer 
                    center={[lat, lng]} 
                    zoom={15} 
                    zoomControl={false}
                    dragging={false}
                    scrollWheelZoom={false}
                    className="w-full h-full z-0 relative"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[lat, lng]} icon={getMarkerIcon(report.status)} />
                  </MapContainer>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Details Card */}
              <div className="bg-white rounded-2xl border border-white-stroke p-6 shadow-2xs">
                <h3 className="font-bold text-black mb-4">Report Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-black-icon mt-0.5" />
                    <div>
                      <p className="text-xs text-paragraph">Reported On</p>
                      <p className="text-sm font-semibold text-black">{report.date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-alert-error mt-0.5" />
                    <div>
                      <p className="text-xs text-paragraph">Urgency</p>
                      <p className={`text-sm font-semibold ${report.urgency === 'Critical' || report.urgency === 'Very Urgent' ? 'text-alert-error' : 'text-black'}`}>
                        {report.urgency}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-black-icon mt-0.5" />
                    <div>
                      <p className="text-xs text-paragraph">Reported By</p>
                      <p className="text-sm font-semibold text-black">Mercy Belrah</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-white rounded-2xl border border-white-stroke p-6 shadow-2xs">
                <h3 className="font-bold text-black mb-6">Status Timeline</h3>
                <div className="space-y-6 relative">
                  <div className="absolute left-[11px] top-3 bottom-4 w-0.5 bg-white-stroke z-0"></div>
                  
                  {timelineSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    
                    return (
                      <div key={step} className="flex items-start gap-4 relative z-10">
                        <div className="mt-0.5 shrink-0 bg-white">
                          {isCompleted ? (
                            <CheckCircle2 className={`w-6 h-6 ${isCurrent ? 'text-primary' : 'text-primary/60'}`} />
                          ) : (
                            <Circle className="w-6 h-6 text-white-stroke" />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${isCompleted ? 'text-black' : 'text-black-placeholder'}`}>
                            {step}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-paragraph mt-1">Current status of the report.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="border-t border-white-stroke bg-white py-6 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-black-placeholder">
          <div>Copyright © CleanReport</div>
          <div className="flex items-center gap-6">
            <Link to="#" className="hover:text-black transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-black transition-colors">Terms</Link>
            <Link to="#" className="hover:text-black transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
