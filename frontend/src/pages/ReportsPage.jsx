import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Sprout,
  FileText,
  Search,
  Filter,
  Clock,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Plus,
  Activity,
  Sun,
  Gift,
  ChevronDown,
  Check,
  Bell,
  ChevronRight,
} from 'lucide-react';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import ReportsFilterModal from '../components/ReportsFilterModal';
import fallbackImage from '../assets/fallback-image.svg';

export const getCardPhotoUrl = (report) => {
  if (
    report &&
    report.photoUrl &&
    report.photoUrl !== 'null' &&
    report.photoUrl !== 'undefined' &&
    report.photoUrl.trim() !== ''
  ) {
    return report.photoUrl;
  }
  return fallbackImage;
};


import api from '../services/api';

export default function ReportsPage() {
  const navigate = useNavigate();

  // Filter & Search states
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilters, setActiveCategoryFilters] = useState([]);
  const [activeUrgencyFilters, setActiveUrgencyFilters] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsList, setReportsList] = useState([]);
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

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get(`/reports?size=100&t=${Date.now()}`);
        const data = response.data?.data;
        let backendReports = Array.isArray(data) ? data : (data?.content || []);
        
        // Override logic removed to ensure strictly matching backend data

        const mappedReports = backendReports.map(mapBackendReportToFrontend);
        
        mappedReports.sort((a, b) => (b.rawDate || 0) - (a.rawDate || 0));
        setReportsList(mappedReports);
      } catch (error) {
        console.error('Failed to fetch reports from backend:', error);
        // Fallback to local storage and default data if API fails
        try {
          const stored = (localStorage.getItem('saved_reports') || sessionStorage.getItem('saved_reports'));
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              parsed.sort((a, b) => (b.rawDate || 0) - (a.rawDate || 0));
              setReportsList(parsed);
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {}
        setReportsList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const statusTabs = ['All', 'Reported', 'Resolved', 'In Progress', 'Pending'];

  const handleRetrieveReward = () => {
    toast.success('Rewards system check: Please check your active points balance in Rewards!');
    navigate('/rewards');
  };

  // Filter cards based on activeTab, searchQuery, category, and urgency
  const filteredReports = reportsList.filter((report) => {
    const matchesStatus = activeTab === 'All' || report.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategoryFilters.length === 0 ||
      activeCategoryFilters.some(
        (cat) =>
          report.title.toLowerCase().includes(cat.toLowerCase()) ||
          (report.category && report.category.toLowerCase() === cat.toLowerCase())
      );
    const matchesUrgency =
      activeUrgencyFilters.length === 0 ||
      activeUrgencyFilters.includes(report.urgency || 'Routine');
    return matchesStatus && matchesSearch && matchesCategory && matchesUrgency;
  });

  // Dynamic pagination: exactly 9 cards per page so page 2 activates at the 10th report
  const REPORTS_PER_PAGE = 9;
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / REPORTS_PER_PAGE));
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * REPORTS_PER_PAGE,
    currentPage * REPORTS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, activeCategoryFilters, activeUrgencyFilters]);

  // Helper for color-coded status pills using tailwind tokens
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
                All Community Reports
              </h1>
              <p className="text-sm sm:text-base text-paragraph">
                Manage and track community issues reported across the city
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleRetrieveReward}
                className="px-4 py-2.5 rounded-xl border border-white-stroke bg-white text-black font-semibold text-xs sm:text-sm shadow-2xs hover:bg-white-bg transition-all flex items-center gap-2 active:scale-95"
              >
                <Gift className="w-4 h-4 text-black-icon" /> Retrieve Reward
              </button>
              <Link
                to="/report"
                className="px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs sm:text-sm shadow-sm hover:bg-primary/90 transition-all flex items-center gap-1.5 active:scale-95"
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
                    className={`px-4 py-1.5 rounded-lg font-semibold text-xs transition-all ${
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

            {/* Right Controls: Search + Categories + Filter */}
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="w-4 h-4 text-black-icon absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="search for a report"
                  className="w-full pl-9 pr-3.5 py-2 border border-white-stroke rounded-xl text-xs sm:text-sm bg-white-bg focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-black font-medium placeholder:text-black-placeholder"
                />
              </div>

              {/* Filter Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(true)}
                  className={`px-3.5 py-2 border border-white-stroke rounded-xl text-xs sm:text-sm bg-white font-medium text-paragraph flex items-center gap-2 hover:bg-white-bg transition-colors shadow-2xs ${
                    activeCategoryFilters.length + activeUrgencyFilters.length > 0 ? 'border-primary text-primary bg-alert-successLight' : ''
                  }`}
                >
                  <Filter className="w-3.5 h-3.5 text-black-icon" /> Filter
                  {activeCategoryFilters.length + activeUrgencyFilters.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                      {activeCategoryFilters.length + activeUrgencyFilters.length}
                    </span>
                  )}
                </button>
                {activeCategoryFilters.length + activeUrgencyFilters.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategoryFilters([]);
                      setActiveUrgencyFilters([]);
                      toast.info('Filters cleared');
                    }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Bar — Mobile / Tablet View */}
          <div className="lg:hidden mb-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-black-icon absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="search for a report..."
                  className="w-full pl-9 pr-4 py-2.5 border border-white-stroke rounded-xl text-xs sm:text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-black font-medium placeholder:text-black-placeholder shadow-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className={`relative p-2.5 border border-white-stroke rounded-xl bg-white text-black-icon shadow-2xs active:bg-white-bg transition-colors shrink-0 flex items-center justify-center ${
                  activeCategoryFilters.length + activeUrgencyFilters.length > 0 ? 'border-primary text-primary bg-alert-successLight' : ''
                }`}
                aria-label="Filter"
              >
                <Filter className="w-4 h-4" />
                {activeCategoryFilters.length + activeUrgencyFilters.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                    {activeCategoryFilters.length + activeUrgencyFilters.length}
                  </span>
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {statusTabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-xs transition-all whitespace-nowrap shrink-0 border ${
                      isActive
                        ? 'bg-alert-success border-transparent text-white font-bold'
                        : 'bg-white border-white-stroke text-paragraph font-medium hover:bg-white-bg'
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
              <p className="text-sm font-medium text-paragraph">Loading community reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="bg-white border border-white-stroke rounded-2xl p-12 text-center my-8 shadow-2xs">
              <Sprout className="w-12 h-12 text-white-stroke mx-auto mb-3 animate-pulse" />
              <h3 className="text-base sm:text-lg font-bold text-black mb-1">No community reports found</h3>
              <p className="text-xs sm:text-sm text-paragraph mb-6">
                No reports match your current category, status, or keyword filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('All');
                  setSearchQuery('');
                  setActiveCategoryFilters([]);
                  setActiveUrgencyFilters([]);
                }}
                className="px-4 py-2 bg-alert-success text-primary font-semibold text-xs sm:text-sm rounded-xl hover:bg-alert-success/80 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-10">
              {paginatedReports.map((report) => {
                const badge = getStatusBadgeStyle(report.status);
                return (
                  <div
                    key={report.id}
                    className="bg-white rounded-2xl border border-white-stroke p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
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
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
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
                          className="text-xs sm:text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 group/link"
                        >
                          Show Details
                          <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Section — Desktop View */}
          {totalPages > 1 && (
          <div className="hidden md:flex items-center justify-between pt-8 mt-6 border-t border-white-stroke">
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl border border-white-stroke bg-white text-xs font-semibold text-paragraph hover:bg-white-bg disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>

            <div className="flex items-center gap-1.5">
              {(() => {
                // Build a smart page list: always show first, last, current ± 1, with ellipses
                const pages = [];
                for (let p = 1; p <= totalPages; p++) {
                  if (
                    p === 1 ||
                    p === totalPages ||
                    (p >= currentPage - 1 && p <= currentPage + 1)
                  ) {
                    pages.push(p);
                  }
                }
                // Insert ellipsis markers
                const withEllipsis = [];
                pages.forEach((p, i) => {
                  if (i > 0 && p - pages[i - 1] > 1) {
                    withEllipsis.push('...');
                  }
                  withEllipsis.push(p);
                });
                return withEllipsis.map((page, idx) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} className="text-black-placeholder px-2 text-xs font-semibold select-none">
                        ...
                      </span>
                    );
                  }
                  const isCurrent = currentPage === page;
                  return (
                    <button
                      key={`page-${page}`}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg font-bold text-xs transition-all flex items-center justify-center ${
                        isCurrent
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-paragraph hover:bg-white-bg'
                      }`}
                    >
                      {page}
                    </button>
                  );
                });
              })()}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl border border-white-stroke bg-white text-xs font-semibold text-paragraph hover:bg-white-bg disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          )}

          {/* Pagination Section — Mobile View */}
          {totalPages > 1 && (
          <div className="md:hidden flex items-center justify-between pt-6 mt-6 border-t border-white-stroke">
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-white-stroke bg-white text-paragraph disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs active:bg-white-bg"
              aria-label="Previous page"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-paragraph">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-white-stroke bg-white text-paragraph disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs active:bg-white-bg"
              aria-label="Next page"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          )}
        </main>
      </div>

      {/* Desktop & Mobile Footer */}
      <Footer />
      <ReportsFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(filters) => {
          setActiveCategoryFilters(filters.categories || []);
          setActiveUrgencyFilters(filters.urgencies || []);
          toast.success('Filters applied successfully!');
        }}
      />
    </div>
  );
}
