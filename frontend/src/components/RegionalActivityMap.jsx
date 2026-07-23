import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPinned, List, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import MapErrorBoundary from './MapErrorBoundary';
import ReportListView from './ReportListView';
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

const getMarkerIcon = (status) => {
  let color = '#3b82f6'; // default blue
  const s = (status || '').toLowerCase();
  if (s === 'reported') color = '#f59e0b'; // amber
  else if (s === 'acknowledged') color = '#3b82f6'; // blue
  else if (s === 'inprogress' || s === 'in progress') color = '#a855f7'; // purple
  else if (s === 'resolved') color = '#22c55e'; // green

  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const MapBoundsFit = ({ reports }) => {
  const map = useMap();
  useEffect(() => {
    if (reports && reports.length > 0) {
      const bounds = L.latLngBounds(reports.map(r => [r.latitude, r.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [reports, map]);
  return null;
};

const MapCenterTracker = ({ onCityChange }) => {
  const map = useMapEvents({
    moveend: async () => {
      const center = map.getCenter();
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}&zoom=10&addressdetails=1`, {
          headers: {
            "User-Agent": "CleanReport-App/1.0"
          }
        });
        const data = await res.json();
        if (data && data.address) {
          const city = data.address.city || data.address.town || data.address.state || 'the current area';
          onCityChange(city);
        }
      } catch (err) {
        console.error('Failed to reverse geocode map center', err);
      }
    }
  });
  return null;
};

export default function RegionalActivityMap({ reports, mapStatus, onRetry }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'
  const [currentCity, setCurrentCity] = useState('Lagos');

  const filteredReports = reports.filter((r) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Overflow') return r.category === 'OVERFLOW' || (r.title && r.title.toLowerCase().includes('overflow'));
    if (activeFilter === 'Illegal Dumping') return r.category === 'ILLEGAL_DUMPING' || (r.title && r.title.toLowerCase().includes('dumping'));
    if (activeFilter === 'Blocked Drain') return r.category === 'BLOCKED_DRAIN' || (r.title && r.title.toLowerCase().includes('drain'));
    return true;
  });

  return (
    <div className="bg-white border border-white-stroke rounded-2xl shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-white-stroke flex items-center justify-between bg-white z-10 relative">
        <h2 className="font-heading font-bold text-base sm:text-lg text-black">
          Regional Activity
        </h2>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-paragraph">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> High Density
          </div>
          <div className="flex items-center gap-1 bg-white-bg2 p-1 rounded-lg border border-white-stroke">
            <button 
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'map' ? 'bg-primary text-white shadow-sm' : 'text-paragraph hover:text-black hover:bg-white-bg'}`}
              aria-label="Map View"
            >
              <MapPinned className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-paragraph hover:text-black hover:bg-white-bg'}`}
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar (Above Map) */}
      <div className="px-4 py-3 bg-white-bg2 border-b border-white-stroke flex items-center gap-2 overflow-x-auto z-10 relative">
        {['All', 'Overflow', 'Illegal Dumping', 'Blocked Drain'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
              activeFilter === filter
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-paragraph border-white-stroke hover:text-black hover:bg-white-bg'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Status Color Legend */}
      <div className="px-4 py-2 bg-white border-b border-white-stroke flex items-center gap-4 sm:gap-6 overflow-x-auto z-10 relative shrink-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
          <span className="text-[10px] text-paragraph font-semibold tracking-wide">Reported</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
          <span className="text-[10px] text-paragraph font-semibold tracking-wide">Acknowledged</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#a855f7]"></span>
          <span className="text-[10px] text-paragraph font-semibold tracking-wide">In Progress</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
          <span className="text-[10px] text-paragraph font-semibold tracking-wide">Resolved</span>
        </div>
      </div>

      {/* Map Area (Edge to Edge) */}
      <div className="w-full h-80 sm:h-[380px] bg-[#f0ede5] relative overflow-hidden flex items-center justify-center bg-cover bg-center z-0">
        {mapStatus === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-xs font-bold text-primary">Loading live map...</span>
          </div>
        )}
        {mapStatus === 'error' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-white text-alert-error text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-alert-error/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Backend Sleeping</span>
            <button 
              onClick={onRetry} 
              className="ml-1 bg-alert-error/10 hover:bg-alert-error/20 text-alert-error p-1 rounded-full transition-colors"
              title="Retry"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {viewMode === 'map' ? (
          <MapErrorBoundary onMapError={() => setViewMode('list')}>
            <MapContainer
              center={[6.5244, 3.3792]} // Lagos
              zoom={12}
              scrollWheelZoom={false}
              className="w-full h-full z-0"
              style={{ height: '100%', width: '100%' }}
              maxZoom={17}
            >
              <MapBoundsFit reports={filteredReports.filter((r) => r.latitude && r.longitude)} />
              <MapCenterTracker onCityChange={setCurrentCity} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={17}
              />
              <MarkerClusterGroup
                chunkedLoading
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
                maxClusterRadius={40}
              >
                {filteredReports
                  .filter((r) => r.latitude && r.longitude) // Ensure coordinates exist
                  .map((report) => (
                  <Marker
                    key={report.id}
                    position={[report.latitude, report.longitude]}
                    icon={getMarkerIcon(report.status)}
                  >
                    <Popup className="custom-popup rounded-xl">
                      <div className="w-[200px]">
                        {report.photoUrl && (
                          <img 
                            src={report.photoUrl} 
                            alt="Thumbnail evidence for map report popup" 
                            width="200"
                            height="96"
                            loading="lazy"
                            className="w-full h-24 object-cover rounded-t-lg mb-2" 
                              onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                          />
                        )}
                        <div className={`p-3 ${report.photoUrl ? 'pt-0' : ''}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                              (report.status || '').toLowerCase() === 'resolved' ? 'bg-alert-successLight text-primary' :
                              (report.status || '').toLowerCase() === 'inprogress' || (report.status || '').toLowerCase() === 'in progress' ? 'bg-alert-inprogressLight text-alert-inprogress' :
                              (report.status || '').toLowerCase() === 'acknowledged' ? 'bg-alert-infoLight text-alert-info' :
                              'bg-alert-warningLight text-accent'
                            }`}>
                              {report.status || 'Reported'}
                            </span>
                            <span className="text-[9px] font-medium text-black-placeholder">{timeAgo(report.createdAt || report.date)}</span>
                          </div>
                          <h3 className="font-extrabold text-[13px] text-black uppercase mb-1 leading-tight">
                            {report.title || (report.category ? report.category.replace(/_/g, ' ') : 'Sanitation Issue')}
                          </h3>
                          <p className="text-[10px] text-paragraph line-clamp-2 mb-3 leading-snug">
                            {report.description || 'Sanitation issue report'}
                          </p>
                          
                          <Link 
                            to={`/reports/${report.id}`}
                            className="block w-full py-2 bg-primary/10 text-primary text-[10px] font-bold text-center rounded-lg hover:bg-primary/20 transition-colors"
                          >
                            View Report
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          </MapErrorBoundary>
        ) : viewMode === 'list' ? (
          <div className="w-full h-full z-10 relative">
            <ReportListView reports={filteredReports} />
          </div>
        ) : null}

        {/* Bottom Left District Overview Overlay */}
        {viewMode === 'map' && (
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-white border border-white-stroke rounded-lg p-3 sm:p-4 w-[200px] sm:w-[240px] shadow-lg z-[400] pointer-events-none">
            <h3 className="font-bold text-[11px] sm:text-xs text-black mb-1.5">District Overview</h3>
            <p className="text-[9px] sm:text-[10px] text-paragraph leading-relaxed">
              Displaying {filteredReports.length} total active reports across all locations. Zoom out to view reports outside of {currentCity}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
