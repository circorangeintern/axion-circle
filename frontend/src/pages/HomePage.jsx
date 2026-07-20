import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Sprout,
  Plus,
  FileText,
  CheckCircle2,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  MapPin,
  Zap,
  Gift,
  X,
  Smartphone,
  Home,
  Activity,
  Settings,
  Layers,
  Users,
  AlertCircle,
  MapPinned,
  List
} from 'lucide-react';
import AppNavbar from '../components/AppNavbar';
import mapBg from '../assets/map-bg.jpg';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';
import { initialReportsData } from './ReportsPage';
import ReportListView from '../components/ReportListView';
import MapErrorBoundary from '../components/MapErrorBoundary';

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

export default function HomePage() {
  const navigate = useNavigate();

  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem('access_token');
    return Boolean(token && token !== 'undefined' && token !== 'null');
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(Boolean(token && token !== 'undefined' && token !== 'null'));
  }, [location.pathname]);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [reports, setReports] = useState([]);
  const [mapStatus, setMapStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setMapStatus('loading');

        let apiReports = [];
        try {
          const res = await api.get('/reports');
          const content = res.data?.data?.content || [];
          apiReports = Array.isArray(content) ? content : [];
        } catch (apiErr) {
          console.error('Failed to fetch live reports:', apiErr);
          setMapStatus('error');
          return;
        }

        const lagosLat = 6.5244;
        const lagosLng = 3.3792;
        const allReports = [...apiReports].map((r, idx) => ({
          ...r,
          latitude: r.latitude || (lagosLat + (Math.sin(idx * 2.5) * 0.08)),
          longitude: r.longitude || (lagosLng + (Math.cos(idx * 2.5) * 0.08)),
          rawDate: r.createdAt ? new Date(r.createdAt).getTime() : (r.date ? 0 : Date.now())
        }));
        
        allReports.sort((a, b) => (b.rawDate || 0) - (a.rawDate || 0));
        setReports(allReports);
        setMapStatus('success');
      } catch (err) {
        setMapStatus('error');
      }
    };
    fetchReports();
  }, []);

  const handleViewAll = () => {
    if (localStorage.getItem('access_token')) {
      navigate('/reports');
    } else {
      navigate('/login');
    }
  };

  const getUserFirstName = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        const parsed = JSON.parse(storedUser);
        const name = String(parsed?.displayName || parsed?.name || parsed?.fullName || parsed?.username || localStorage.getItem('user_name') || '');
        if (name && name.trim() !== '') {
          return name.split(' ')[0];
        }
        
        // Fallback to email
        const emailStr = String(parsed?.email || localStorage.getItem('user_email') || '');
        if (emailStr && typeof emailStr === 'string' && emailStr.includes('@')) {
           return emailStr.split('@')[0].replace(/[._0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim().split(' ')[0];
        }
      }
    } catch (e) {}
    
    const emailStr = localStorage.getItem('user_email');
    if (emailStr && typeof emailStr === 'string' && emailStr.includes('@')) {
       return emailStr.split('@')[0].replace(/[._0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim().split(' ')[0];
    }
    
    return 'there';
  };

  const firstName = getUserFirstName();

  const filteredReports = reports.filter((r) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Overflow') return r.category === 'OVERFLOW' || (r.title && r.title.toLowerCase().includes('overflow'));
    if (activeFilter === 'Illegal Dumping') return r.category === 'ILLEGAL_DUMPING' || (r.title && r.title.toLowerCase().includes('dumping'));
    if (activeFilter === 'Blocked Drain') return r.category === 'BLOCKED_DRAIN' || (r.title && r.title.toLowerCase().includes('drain'));
    return true;
  });

  return (
    <div className="min-h-screen bg-white-bg sm:bg-white font-body flex flex-col justify-between relative">
      <div>
        <AppNavbar activeTab="dashboard" />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Conditional Hero Section based on Auth State */}
          {!isLoggedIn ? (
            /* Logged Out Hero Section: No action buttons below subtext */
            <div className="mb-6 sm:mb-8">
              <h1 className="font-heading text-[30px] font-semibold leading-[38px] text-black mb-1 sm:mb-1.5 tracking-tight">
                Clean and Report Waste Dumps
              </h1>
              <p className="text-xs sm:text-sm text-paragraph font-medium">
                Report, track and monitor waste collection in your community
              </p>
            </div>
          ) : (
            /* Logged In Hero Section: Welcome back + Retrieve Reward & Add New Report buttons */
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="font-heading text-[30px] font-semibold leading-[38px] text-black mb-1 sm:mb-1.5 tracking-tight">
                  Welcome back, {firstName || 'there'}
                </h1>
                <p className="text-xs sm:text-sm text-paragraph font-medium">
                  Report, track and monitor waste collection in your community
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => toast.success('Reward balance check coming soon!')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white-stroke bg-white text-black font-semibold text-xs sm:text-sm shadow-xs hover:bg-white-bg transition-colors"
                >
                  <Gift className="w-4 h-4 text-primary" /> Retrieve Reward
                </button>
                <Link
                  to="/report"
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs sm:text-sm shadow-sm hover:bg-primary/90 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add New Report
                </Link>
              </div>
            </div>
          )}

          {/* Three Stat Cards — exact Figma structure */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

            {/* 1. Total Reports */}
            <div className="bg-white border border-white-stroke rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[140px]">
              {/* Sparkline — full-width absolute background, bottom half */}
              <div className="absolute bottom-0 right-0 w-2/3 h-16 pointer-events-none opacity-60">
                <svg viewBox="0 0 120 48" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,40 Q30,32 50,22 T90,10 T120,4 L120,48 L0,48 Z" fill="#E9FFEA" />
                  <path d="M0,40 Q30,32 50,22 T90,10 T120,4" fill="none" stroke="#127C2F" strokeWidth="1.5" strokeOpacity="0.4" />
                </svg>
              </div>
              {/* Header row */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#006FED] flex items-center justify-center text-white shadow-sm shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-black">Total Reports</span>
                </div>
                <button className="text-black-icon hover:text-black shrink-0" aria-label="More options">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              {/* Number + badge — same row, bottom */}
              <div className="flex items-baseline gap-3 mt-auto relative z-10">
                <span className="text-[28px] font-bold text-black tracking-tight leading-none">2,420</span>
                <span className="inline-flex items-center gap-0.5 text-primary text-xs font-bold">
                  <ArrowUpRight className="w-3.5 h-3.5" /> 40%
                </span>
              </div>
            </div>

            {/* 2. Resolved Report */}
            <div className="bg-white border border-white-stroke rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[140px]">
              {/* Sparkline — full-width absolute background */}
              <div className="absolute bottom-0 right-0 w-2/3 h-16 pointer-events-none opacity-60">
                <svg viewBox="0 0 120 48" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,10 Q30,18 55,28 T90,36 T120,30 L120,48 L0,48 Z" fill="#FFE8E8" />
                  <path d="M0,10 Q30,18 55,28 T90,36 T120,30" fill="none" stroke="#DB0404" strokeWidth="1.5" strokeOpacity="0.4" />
                </svg>
              </div>
              {/* Header row */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-black">Resolved Report</span>
                </div>
                <button className="text-black-icon hover:text-black shrink-0" aria-label="More options">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              {/* Number + badge — same row */}
              <div className="flex items-baseline gap-3 mt-auto relative z-10">
                <span className="text-[28px] font-bold text-black tracking-tight leading-none">1,210</span>
                <span className="inline-flex items-center gap-0.5 text-alert-error text-xs font-bold">
                  <ArrowDownRight className="w-3.5 h-3.5" /> 10%
                </span>
              </div>
            </div>

            {/* 3. Community Points */}
            <div className="bg-white border border-white-stroke rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[140px]">
              {/* Sparkline — full-width absolute background */}
              <div className="absolute bottom-0 right-0 w-2/3 h-16 pointer-events-none opacity-60">
                <svg viewBox="0 0 120 48" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,36 Q30,28 55,18 T90,8 T120,4 L120,48 L0,48 Z" fill="#E9FFEA" />
                  <path d="M0,36 Q30,28 55,18 T90,8 T120,4" fill="none" stroke="#127C2F" strokeWidth="1.5" strokeOpacity="0.4" />
                </svg>
              </div>
              {/* Header row */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-black">Community Points</span>
                </div>
                <button className="text-black-icon hover:text-black shrink-0" aria-label="More options">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              {/* Number + badge — same row */}
              <div className="flex items-baseline gap-3 mt-auto relative z-10">
                <span className="text-[28px] font-bold text-black tracking-tight leading-none">316</span>
                <span className="inline-flex items-center gap-0.5 text-primary text-xs font-bold">
                  <ArrowUpRight className="w-3.5 h-3.5" /> 20%
                </span>
              </div>
            </div>

          </div>

          {/* Dark Promo Banner — exact Figma colors and structure */}
          {!isBannerDismissed && (
          <div className="bg-[#001310] rounded-2xl p-5 sm:p-7 text-white relative overflow-hidden shadow-md mb-8">
            {/* X close button — top-right, exact Figma */}
            <button
              type="button"
              onClick={() => setIsBannerDismissed(true)}
              className="absolute top-4 right-4 text-white/50 hover:text-white/90 transition-colors z-20"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 pr-8">
              <div>
                {/* "MOBILE EXPERIENCE" label — #ABEFC6 as requested */}
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#ABEFC6] mb-3">
                  <Smartphone className="w-3.5 h-3.5 text-[#ABEFC6]" /> MOBILE EXPERIENCE
                </div>
                <h2 className="font-heading font-bold text-lg sm:text-xl text-white mb-2 leading-tight">
                  CleanReport on your Home Screen
                </h2>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-md">
                  Get instant notifications and report issues faster by installing CleanReport as a lightweight app. No store download required.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Install App — bg-[#ABEFC6] fill, #001310 text — exact Figma */}
                <button
                  type="button"
                  onClick={() => toast.success('CleanReport mobile app installation link sent!')}
                  className="inline-flex items-center gap-2 bg-[#ABEFC6] text-[#001310] font-bold px-4 py-2.5 rounded-xl text-sm border border-[#ABEFC6] hover:bg-[#ABEFC6]/90 transition-colors shadow-sm"
                >
                  <Smartphone className="w-4 h-4 text-[#001310]" /> Install App
                </button>
                {/* Learn More — dark filled bg, white text — exact Figma */}
                <button
                  type="button"
                  onClick={() => toast.success('Learn more modal coming soon!')}
                  className="inline-flex items-center gap-1.5 bg-[#0a1f1c] border border-white/10 text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-white/10 transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Decorative Sprout watermark */}
            <Sprout className="w-40 h-40 absolute -left-6 -top-6 text-primary/10 pointer-events-none -rotate-12" />
          </div>
          )}

          {/* Main Layout Grid: Left Column (Regional Activity + Local Goals & Energy Saving) + Right Column (Recent Report) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Left Column (Span 7): Regional Activity Map + Bottom Two Cards */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* 1. Regional Activity Map Card */}
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
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Backend Disconnected
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
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
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
                                  <img src={report.photoUrl} alt="Report evidence" className="w-full h-24 object-cover rounded-t-lg mb-2" />
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
                                    <span className="text-[10px] text-paragraph font-medium">{timeAgo(report.createdAt || report.date)}</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-black mb-0.5 leading-tight">{report.title || report.category || 'Sanitation Issue'}</h4>
                                  <p className="text-[10px] text-paragraph line-clamp-2 mb-2 leading-relaxed">{report.description}</p>
                                  <Link
                                    to={`/reports/${report.id}`}
                                    className="block w-full text-center py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[10px] rounded transition-colors"
                                  >
                                    View Report
                                  </Link>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
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
                        Most reports currently localized in North Sector (Road Maintenance). 4 new reports in last hour.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Bottom Two Cards (Local Goals + Energy Saving) placed inside Left Column right under Regional Activity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Local Goals (Dark Card) */}
                <div className="bg-[#001310] text-white rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[170px] border border-white/10">
                  <div className="relative z-10 mb-6">
                    <h3 className="font-heading font-bold text-base sm:text-lg text-white mb-1">
                      Local Goals
                    </h3>
                    <p className="text-xs sm:text-sm text-white/80 font-medium">
                      Progress on the Green District Initiative.
                    </p>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                        512 / 1,000
                      </span>
                      <span className="text-xs sm:text-sm text-[#ABEFC6] font-semibold">
                        Trees Planted
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full w-[51.2%] transition-all duration-500"></div>
                    </div>
                  </div>

                  {/* Decorative Watermark Sprout — #ABEFC6 mint outline matching Figma */}
                  <Sprout className="w-28 h-28 absolute -bottom-6 -right-6 text-[#ABEFC6]/15 pointer-events-none" />
                </div>

                {/* Energy Saving (Light Card) */}
                <div className="bg-white border border-white-stroke rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[170px]">
                  <div className="relative z-10 mb-6">
                    <h3 className="font-heading font-bold text-base sm:text-lg text-primary mb-1">
                      Energy Saving
                    </h3>
                    <p className="text-xs sm:text-sm text-paragraph font-medium">
                      Community effort to reduce street light waste.
                    </p>
                  </div>

                  <div className="flex items-center gap-3.5 relative z-10">
                    <span className="text-2xl sm:text-3xl font-bold text-primary tracking-tight shrink-0">
                      14%
                    </span>
                    <p className="text-xs sm:text-sm text-primary leading-snug font-semibold">
                      Efficiency increase since last quarter. You saved $12 this month.
                    </p>
                  </div>

                  {/* Decorative Watermark Lightning */}
                  <Zap className="w-24 h-24 absolute -bottom-5 -right-5 text-primary/15 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right Column (Span 5): Recent Report stretching down alongside both Regional Activity & Bottom Cards */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="bg-white border border-white-stroke rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between flex-1">
                <div className="flex flex-col justify-between flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading font-bold text-base sm:text-lg text-black">
                      Recent Report
                    </h2>
                    <button
                      type="button"
                      onClick={handleViewAll}
                      className="text-xs sm:text-sm font-semibold text-primary hover:underline cursor-pointer"
                    >
                      view all
                    </button>
                  </div>

                  {/* 6 Static Report Rows — evenly distributed across the entire card height to match Left Column perfectly */}
                  <div className="divide-y divide-white-stroke flex flex-col justify-between flex-1">
                    {reports.length === 0 && (
                      <div className="py-8 text-center text-sm text-paragraph">No recent reports found</div>
                    )}
                    {reports.slice(0, 6).map((report, idx) => {
                      const status = (report.status || 'Reported').toLowerCase();
                      const statusConfig = {
                        'resolved': { bg: 'bg-alert-successLight', text: 'text-primary', border: 'border-alert-successStroke', label: 'Resolved' },
                        'inprogress': { bg: 'bg-alert-inprogressLight', text: 'text-alert-inprogress', border: 'border-alert-inprogressStroke', label: 'In Progress' },
                        'in progress': { bg: 'bg-alert-inprogressLight', text: 'text-alert-inprogress', border: 'border-alert-inprogressStroke', label: 'In Progress' },
                        'acknowledged': { bg: 'bg-alert-infoLight', text: 'text-alert-info', border: 'border-alert-infoStroke', label: 'Acknowledged' },
                      };
                      const config = statusConfig[status] || { bg: 'bg-alert-warningLight', text: 'text-accent', border: 'border-alert-warningStroke', label: 'Reported' };

                      return (
                        <div key={report.id || idx} className="py-3 flex flex-col justify-center first:pt-0 last:pb-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`${config.bg} ${config.text} border ${config.border} px-2.5 py-0.5 rounded-full text-[11px] font-semibold`}>
                              {config.label}
                            </span>
                            <span className="text-[11px] text-black-placeholder">{timeAgo(report.createdAt || report.date)}</span>
                          </div>
                          <h3 className="text-xs sm:text-sm font-bold text-black">{report.title || report.category || 'Sanitation Issue'}</h3>
                          <div className="flex items-center gap-1 text-[11px] text-black-icon mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{report.address || report.areaName || 'Location unavailable'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-white-stroke bg-white py-6 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-black-placeholder">
          <div>Copyright © CleanReport</div>
          <div className="flex items-center gap-6">
            <Link to="#" className="hover:text-black transition-colors">
              Privacy
            </Link>
            <Link to="#" className="hover:text-black transition-colors">
              Terms
            </Link>
            <Link to="#" className="hover:text-black transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating Action Button (FAB) always shown for quick reporting */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link
          to="/report"
          className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
          aria-label="New Report"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>

    </div>
  );
}
