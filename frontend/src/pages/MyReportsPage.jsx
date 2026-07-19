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

// Curated list of high-resolution real authentic environmental, garden waste, overflow, and municipal sanitation photos
const realFallbackPhotos = [
  'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1510251197878-a2e6d2fc89d7?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&q=80&w=600',
];

const getCardPhotoUrl = (report) => {
  if (
    report &&
    report.photoUrl &&
    report.photoUrl !== 'https://res.cloudinary.com/demo/image/upload/v1/evidence.jpg' &&
    report.photoUrl !== 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
  ) {
    return report.photoUrl;
  }
  const idStr = String(report?.id || '0');
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % realFallbackPhotos.length;
  return realFallbackPhotos[idx];
};

// Initial default user reports so page looks rich right on first load
const defaultMyReports = [
  {
    id: 101,
    title: 'Garden Waste & Litter',
    category: 'Garden Waste',
    urgency: 'Routine',
    status: 'In Progress',
    description: 'Waste littered around the Penchwood garden for over 3 weeks and counting. Requires immediate municipal dispatch.',
    date: '17/07 - 14:20',
    address: '7 Silver Str, by Broad Road, Lagos',
    indicator: 'alert',
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 102,
    title: 'Blocked Drainage & Overflow',
    category: 'Blocked Drainage',
    urgency: 'Critical',
    status: 'Reported',
    description: 'Heavy rain caused the drainage on Admiralty Way to overflow into pedestrian walkway and street.',
    date: '15/07 - 09:15',
    address: '14 Admiralty Way, Lekki Phase 1, Lagos',
    indicator: 'gauge',
    photoUrl: 'https://images.unsplash.com/photo-1510251197878-a2e6d2fc89d7?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 103,
    title: 'Illegal Dumping / Refuse Pile',
    category: 'Illegal Dumping',
    urgency: 'Very Urgent',
    status: 'Resolved',
    description: 'Large pile of household refuse dumped overnight beside the community playground gate.',
    date: '10/07 - 16:48',
    address: 'Plot 4, Allen Avenue, Ikeja, Lagos',
    indicator: 'sun',
    photoUrl: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80&w=600',
  },
];

const statusTabs = ['All', 'Reported', 'In Progress', 'Resolved', 'Acknowledged'];

import api from '../services/api';

export default function MyReportsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState([]);

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

    return {
      id: report.id || Math.random().toString(),
      title: categoryLabel || 'Sanitation Issue',
      category: categoryLabel,
      urgency: urgencyLabel,
      status: statusLabel,
      description: report.description || 'Sanitation issue report',
      date: dateStr,
      address: report.areaName || 'Location unavailable — tap Edit Location to set manually',
      indicator: indicator,
      photoUrl: report.photoUrl,
    };
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get(`/reports/my?t=${Date.now()}`);
        const backendReports = response.data?.data || [];
        const mappedReports = backendReports.map(mapBackendReportToFrontend);
        
        // Combine backend reports with initial dummy data
        setReports([...mappedReports, ...defaultMyReports]);
      } catch (error) {
        console.error('Failed to fetch reports from backend:', error);
        // Fallback to local storage and default data if API fails
        try {
          const stored = localStorage.getItem('user_my_reports');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setReports([...parsed, ...defaultMyReports]);
              return;
            }
          }
        } catch (e) {}
        setReports(defaultMyReports);
      }
    };

    fetchReports();
  }, []);

  const handleRetrieveReward = () => {
    toast.success('You have earned +50 Eco-Points from your reports! Check Rewards.');
    navigate('/rewards');
  };

  const handleClearSavedReports = () => {
    localStorage.removeItem('user_my_reports');
    setReports(defaultMyReports);
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
          {filteredReports.length === 0 ? (
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
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

                        {/* Optional badge for newly submitted reports */}
                        {String(report.id).length > 10 && (
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
