import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Sprout,
  FileText,
  Search,
  Clock,
  MapPin,
  Plus,
  Activity,
  Sun,
  Gift,
  Bell,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import AppNavbar from '../components/AppNavbar';

const getCardPhotoUrl = (report) => {
  if (
    report &&
    report.photoUrl &&
    report.photoUrl !== 'null' &&
    report.photoUrl !== 'undefined' &&
    report.photoUrl.trim() !== ''
  ) {
    return report.photoUrl;
  }
  return 'https://placehold.co/600x400/eeeeee/999999?text=No+Image';
};

const statusTabs = ['All', 'Reported', 'In Progress', 'Resolved', 'Acknowledged'];

import api from '../services/api';

export default function MyReportsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const mapBackendReportToFrontend = (report) => {
    const formatEnum = (str) => {
      if (!str) return 'Routine';
      return str.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    };
    
    const categoryLabel = formatEnum(report.category);
    const urgencyLabel = formatEnum(report.urgency);
    const statusLabel = formatEnum(report.status);
    
    let dateStr = 'Unknown Date';
    if (report.createdAt) {
      const d = new Date(report.createdAt);
      dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }) + ' - ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    let indicator = 'sun';
    if (report.urgency === 'CRITICAL' || report.urgency === 'VERY_URGENT') indicator = 'alert';
    else if (report.status === 'IN_PROGRESS') indicator = 'gauge';

    let finalTitle = report.title;
    if (finalTitle && /^[A-Z_]+$/.test(finalTitle)) {
      finalTitle = formatEnum(finalTitle);
    }

    return {
      id: report.id || Math.random().toString(),
      title: finalTitle || categoryLabel || 'Sanitation Issue',
      category: categoryLabel,
      urgency: urgencyLabel,
      status: statusLabel,
      description: report.description || 'Sanitation issue report',
      date: dateStr,
      address: (report.address || report.areaName || '').includes('Location unavailable') ? 'Location not automatically captured' : (report.address || report.areaName || 'Location not captured'),
      indicator: indicator,
      photoUrl: report.photoUrl,
      reporterName: report.reporterName || 'Anonymous',
      rawDate: report.createdAt ? new Date(report.createdAt).getTime() : Date.now(),
    };
  };

  const getUserInfo = () => {
    try {
      const storedUser = (localStorage.getItem('user') || sessionStorage.getItem('user'));
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        const parsed = JSON.parse(storedUser);
        let dName = String(parsed?.displayName || parsed?.name || parsed?.fullName || parsed?.username || (localStorage.getItem('user_name') || sessionStorage.getItem('user_name')) || '');
        const email = String(parsed?.email || (localStorage.getItem('user_email') || sessionStorage.getItem('user_email')) || '');
        if (!dName || dName.trim() === '') {
           if (email && email.includes('@')) {
               dName = email.split('@')[0].replace(/[._0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();
           } else {
               dName = 'there';
           }
        }
        return { displayName: dName, email: email };
      }
    } catch (e) {}
    let dName = String((localStorage.getItem('user_name') || sessionStorage.getItem('user_name')) || '');
    const email = String((localStorage.getItem('user_email') || sessionStorage.getItem('user_email')) || '');
    if (!dName || dName.trim() === '') {
       if (email && email.includes('@')) {
           dName = email.split('@')[0].replace(/[._0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();
       } else {
           dName = 'there';
       }
    }
    return { displayName: dName, email: email };
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get(`/reports/my?t=${Date.now()}`);
        const data = response.data?.data;
        let backendReports = Array.isArray(data) ? data : (data?.content || []);
        
        // Filter out reports that do not belong to the current user, as a safeguard
        const currentUser = getUserInfo();
        if (currentUser.displayName && currentUser.displayName !== 'there') {
          backendReports = backendReports.filter(report => 
            report.reporterName && 
            report.reporterName.toLowerCase() === currentUser.displayName.toLowerCase()
          );
        }
        
        try {
          const overrides = JSON.parse((localStorage.getItem('reported_overrides') || sessionStorage.getItem('reported_overrides')) || '{}');
          let pending = JSON.parse((localStorage.getItem('pending_reports') || sessionStorage.getItem('pending_reports')) || '[]');
          
          backendReports = backendReports.map(report => {
            let modified = { ...report };
            if (overrides[report.id]) {
              modified = { ...modified, ...overrides[report.id] };
            } else if (pending.length > 0) {
              const reportTime = new Date(report.createdAt).getTime();
              const matchedIdx = pending.findIndex(p => Math.abs(p.timestamp - reportTime) < 120000);
              if (matchedIdx !== -1) {
                const matchedOverride = pending[matchedIdx];
                modified = { ...modified, ...matchedOverride };
                overrides[report.id] = matchedOverride;
                pending.splice(matchedIdx, 1);
                localStorage.setItem('report_overrides', JSON.stringify(overrides));
                localStorage.setItem('pending_overrides', JSON.stringify(pending));
              }
            }
            return modified;
          });
        } catch (e) {
          console.error('Failed to apply overrides', e);
        }

        const mappedReports = backendReports.map(mapBackendReportToFrontend);
        
        mappedReports.sort((a, b) => (b.rawDate || 0) - (a.rawDate || 0));
        setReports(mappedReports);
      } catch (error) {
        console.error('Failed to fetch reports from backend:', error);
        // Fallback to local storage and default data if API fails
        try {
          const stored = (localStorage.getItem('saved_reports') || sessionStorage.getItem('saved_reports'));
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              parsed.sort((a, b) => (b.rawDate || 0) - (a.rawDate || 0));
              setReports(parsed);
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {}
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleRetrieveReward = () => {
    toast.success('You have earned +50 Eco-Points from your reports! Check Rewards.');
    navigate('/rewards');
  };

  const handleClearSavedReports = () => {
    localStorage.removeItem('saved_reports'); sessionStorage.removeItem('saved_reports');
    setReports([]);
    toast.success('Local test submissions cleared.');
  };

  // Filter logic
  const filteredReports = reports.filter((report) => {
    const statusMatch =
      activeTab === 'All' ||
      report.status.toLowerCase() === activeTab.toLowerCase();

    const query = searchQuery.trim().toLowerCase();
    const searchMatch =
      !query ||
      report.title.toLowerCase().includes(query) ||
      report.description.toLowerCase().includes(query) ||
      report.address.toLowerCase().includes(query);

    return statusMatch && searchMatch;
  });

  // Helper for pill badge styling per status
  const getStatusBadgeStyle = (status) => {
    const s = status.toLowerCase();
    if (s === 'reported') {
      return {
        pillClass: 'bg-status-reported/15 text-status-reported border border-status-reported/30',
        text: 'Reported',
      };
    }
    if (s === 'in progress') {
      return {
        pillClass: 'bg-status-inprogress/15 text-status-inprogress border border-status-inprogress/30',
        text: 'Inprogress',
      };
    }
    if (s === 'resolved') {
      return {
        pillClass: 'bg-status-resolved/15 text-status-resolved border border-status-resolved/30',
        text: 'Resolved',
      };
    }
    if (s === 'acknowledged') {
      return {
        pillClass: 'bg-status-acknowledged/15 text-status-acknowledged border border-status-acknowledged/30',
        text: 'Acknowledged',
      };
    }
    return {
      pillClass: 'bg-white-bg2 text-paragraph border border-white-stroke',
      text: status,
    };
  };

  // Helper for small top-right circular flag/dot indicators
  const renderIndicator = (indicator) => {
    if (indicator === 'alert') {
      return (
        <div className="w-7 h-7 rounded-full bg-alert-errorLight text-alert-error flex items-center justify-center border border-alert-error/20 shadow-2xs shrink-0">
          <Bell className="w-3.5 h-3.5 fill-alert-error text-alert-error" />
        </div>
      );
    }
    if (indicator === 'gauge') {
      return (
        <div className="w-7 h-7 rounded-full bg-white-bg text-primary flex items-center justify-center border border-white-stroke shadow-2xs shrink-0">
          <Activity className="w-3.5 h-3.5 text-primary" />
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full bg-white-bg text-accent flex items-center justify-center border border-white-stroke shadow-2xs shrink-0">
        <Sun className="w-3.5 h-3.5 fill-accent text-accent" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white-bg sm:bg-white font-body flex flex-col justify-between relative">
      <div>
        <AppNavbar activeTab="reports" />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* Header Title & CTA Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <h1 className="font-heading text-[30px] font-semibold leading-[38px] text-black mb-1.5 sm:mb-2 tracking-tight">
                My Submitted Reports
              </h1>
              <p className="text-sm sm:text-base text-paragraph">
                Track, manage, and monitor the real-time resolution status of all issues you reported
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleRetrieveReward}
                className="px-4 py-2.5 rounded-xl border border-white-stroke bg-white text-black font-semibold text-xs sm:text-sm shadow-2xs hover:bg-white-bg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Gift className="w-4 h-4 text-black-icon" /> Retrieve Reward
              </button>
              <Link
                to="/report"
                className="px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs sm:text-sm shadow-sm hover:bg-primary/90 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Report
              </Link>
            </div>
          </div>

          {/* Filter Bar — Desktop View */}
          <div className="hidden lg:flex items-center justify-between gap-4 p-2.5 bg-white border border-white-stroke rounded-2xl shadow-xs mb-8">
            {/* Left Segmented Status Pill Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white-bg2 border border-white-stroke rounded-xl">
              {statusTabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-black shadow-xs border border-white-stroke'
                        : 'text-paragraph hover:text-black'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Search */}
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="w-4 h-4 text-black-icon absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="search your reports..."
                  aria-label="Search your reports"
                  className="w-full pl-9 pr-4 py-2 border border-white-stroke rounded-xl text-xs sm:text-sm bg-white-bg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-black font-medium placeholder:text-black-placeholder"
                />
              </div>
            </div>
          </div>

          {/* Filter Bar — Mobile & Tablet View */}
          <div className="flex flex-col gap-3 mb-6 lg:hidden">
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-black-icon absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="search your reports..."
                aria-label="Search your reports"
                className="w-full pl-9 pr-4 py-2.5 border border-white-stroke rounded-xl text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-black font-medium placeholder:text-black-placeholder shadow-xs"
              />
            </div>

            {/* Scrollable Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {statusTabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-white border border-white-stroke text-paragraph hover:text-black'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Report Cards Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium text-paragraph">Loading your reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="bg-white border border-white-stroke rounded-2xl p-12 text-center my-8 shadow-2xs">
              <Sprout className="w-12 h-12 text-white-stroke mx-auto mb-3 animate-pulse" />
              <h3 className="text-base sm:text-lg font-bold text-black mb-1">No submitted reports found</h3>
              <p className="text-xs sm:text-sm text-paragraph mb-6">
                You have not submitted any reports matching your current filter status or search keyword.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-alert-successLight text-primary font-semibold text-xs sm:text-sm rounded-xl hover:bg-alert-successLight/80 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-10">
              {filteredReports.map((report) => {
                const badge = getStatusBadgeStyle(report.status);
                return (
                  <div
                    key={report.id}
                    className="bg-white rounded-2xl border border-white-stroke p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group overflow-hidden"
                  >
                    <div>
                      {/* Top Row: Status Pill & Indicator */}
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        <span className={`${badge.pillClass} font-semibold px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1`}>
                          {badge.text}
                        </span>
                        {renderIndicator(report.indicator)}
                      </div>

                      {/* Uniform h-44 Real Photo Image Box */}
                      <div className="mb-4 rounded-xl overflow-hidden border border-white-stroke h-44 bg-white-bg relative group/banner shrink-0">
                        <img
                          src={getCardPhotoUrl(report)}
                          alt={report.title}
                          width="400"
                          height="176"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallbackImage;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Title */}
                      <h3 className="font-heading font-bold text-base sm:text-lg text-black mb-2 group-hover:text-primary transition-colors">
                        {report.title}
                      </h3>

                      {/* Description Text */}
                      <p className="text-xs sm:text-sm text-paragraph line-clamp-3 mb-4 leading-relaxed">
                        {report.description}
                      </p>
                    </div>

                    <div>
                      {/* Metadata: Date & Location */}
                      <div className="space-y-2 mb-5 text-xs text-black-icon font-medium">
                        <div className="flex items-center gap-2 text-black-icon">
                          <Clock className="w-3.5 h-3.5 text-black-icon shrink-0" />
                          <span>{report.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-black-icon">
                          <MapPin className="w-3.5 h-3.5 text-black-icon shrink-0" />
                          <span className="truncate">{report.address}</span>
                        </div>
                        {report.reporterName && (
                          <div className="flex items-center gap-2 text-black-icon">
                            <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-[8px] bg-white-stroke rounded-full shrink-0">@</span>
                            <span className="truncate">By {report.reporterName}</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Link: Show Details */}
                      <div className="pt-3.5 border-t border-white-stroke flex items-center justify-between">
                        <Link
                          to={`/reports/${report.id}`}
                          className="text-xs sm:text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 group/link cursor-pointer"
                        >
                          Show Details
                          <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                        </Link>

                        {/* Optional badge for newly submitted reports (within last 1 hour) */}
                        {Date.now() - report.rawDate < 3600000 && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-alert-successLight px-2 py-0.5 rounded">
                            Just Added
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
