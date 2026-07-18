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
import ReportsFilterModal from '../components/ReportsFilterModal';

import img1 from '../assets/reports/1.jpg';
import img2 from '../assets/reports/2.jpg';
import img3 from '../assets/reports/3.jpg';
import img4 from '../assets/reports/4.jpg';
import img5 from '../assets/reports/5.jpg';
import img6 from '../assets/reports/6.jpg';
import img7 from '../assets/reports/7.jpg';
import img8 from '../assets/reports/8.jpg';
import img9 from '../assets/reports/9.jpg';
import img10 from '../assets/reports/10.jpg';
import img11 from '../assets/reports/11.jpg';
import img12 from '../assets/reports/12.jpg';

// Curated list of high-resolution real authentic environmental, garden waste, overflow, and municipal sanitation photos
const realFallbackPhotos = [
  img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12
];

export const getCardPhotoUrl = (report) => {
  if (report && report.photoUrl && report.photoUrl !== 'https://res.cloudinary.com/demo/image/upload/v1/evidence.jpg') {
    return report.photoUrl;
  }
  const idx = Math.abs(Number(report?.id || 0)) % realFallbackPhotos.length;
  return realFallbackPhotos[idx];
};

// Static cards covering all categories with exact real matching photography per item
export const initialReportsData = [
  {
    id: 1,
    title: 'Overflowing Bin',
    category: 'Overflowing Bin',
    urgency: 'Very Urgent',
    status: 'In Progress',
    description: 'Public refuse bins overflowing onto the sidewalk along Broad Road, causing sanitation issues and foul odor.',
    date: '02/06 - 16:48',
    address: '7 Silver Str, by Broad Road, Lagos',
    indicator: 'alert',
    photoUrl: img1,
  },
  {
    id: 2,
    title: 'Street Litter',
    category: 'Street Litter',
    urgency: 'Routine',
    status: 'Reported',
    description: 'Plastic bottles, food wrappers, and general litter scattered across the pedestrian walkway near Penchwood park entrance.',
    date: '02/06 - 16:48',
    address: '12 Admiralty Way, Lekki Phase 1, Lagos',
    indicator: 'gauge',
    photoUrl: img2,
  },
  {
    id: 3,
    title: 'Blocked Drainage',
    category: 'Blocked Drainage',
    urgency: 'Critical',
    status: 'Resolved',
    description: 'Heavy rain caused the storm drainage on Ozumba Mbadiwe to back up and flood the roadway with trapped debris.',
    date: '02/06 - 16:48',
    address: '44 Ozumba Mbadiwe Ave, Victoria Island, Lagos',
    indicator: 'sun',
    photoUrl: img3,
  },
  {
    id: 4,
    title: 'Illegal Dumping',
    category: 'Illegal Dumping',
    urgency: 'Critical',
    status: 'Acknowledged',
    description: 'Multiple large black refuse bags illegally dumped overnight in the open vacant lot beside the commercial plaza.',
    date: '02/06 - 16:48',
    address: '8 Allen Avenue, Ikeja, Lagos',
    indicator: 'sun',
    photoUrl: img4,
  },
  {
    id: 5,
    title: 'Garden Waste',
    category: 'Garden Waste',
    urgency: 'Routine',
    status: 'In Progress',
    description: 'Overgrown tree branches, cut grass clippings, and hedge trimmings left piled on the curb for over 3 weeks.',
    date: '02/06 - 16:48',
    address: '19 Bourdillon Road, Ikoyi, Lagos',
    indicator: 'gauge',
    photoUrl: img5,
  },
  {
    id: 6,
    title: 'Residential Dump',
    category: 'Residential Dump',
    urgency: 'Very Urgent',
    status: 'Reported',
    description: 'Household waste accumulation outside residential compound due to missed municipal collection schedules this week.',
    date: '02/06 - 16:48',
    address: '5 Bode Thomas St, Surulere, Lagos',
    indicator: 'alert',
    photoUrl: img6,
  },
  {
    id: 7,
    title: 'Commercial Dump',
    category: 'Commercial Dump',
    urgency: 'Very Urgent',
    status: 'Reported',
    description: 'Industrial and commercial packaging cardboard and wooden crates overflowing from warehouse alleyway container.',
    date: '02/06 - 16:48',
    address: '22 Warehouse Road, Apapa, Lagos',
    indicator: 'sun',
    photoUrl: img7,
  },
  {
    id: 8,
    title: 'Overflowing Bin',
    category: 'Overflowing Bin',
    urgency: 'Routine',
    status: 'Resolved',
    description: 'Community recycling and general refuse collection containers completely filled to capacity near the central bus stop.',
    date: '02/06 - 16:48',
    address: '10 Marina Street, Lagos Island, Lagos',
    indicator: 'alert',
    photoUrl: img8,
  },
  {
    id: 9,
    title: 'Street Litter',
    category: 'Street Litter',
    urgency: 'Routine',
    status: 'Acknowledged',
    description: 'Discarded paper cups, cans, and flyers littering the sidewalk along the commercial shopping strip.',
    date: '02/06 - 16:48',
    address: '35 Awolowo Way, Ikeja, Lagos',
    indicator: 'gauge',
    photoUrl: img9,
  },
  {
    id: 10,
    title: 'Hazardous Waste',
    category: 'Hazardous Waste',
    urgency: 'Critical',
    status: 'Reported',
    description: 'Unlabelled chemical drums and industrial solvent containers abandoned along the waterfront, posing an environmental and health hazard.',
    date: '03/06 - 09:15',
    address: '3 Creek Road, Apapa, Lagos',
    indicator: 'alert',
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 11,
    title: 'Water Pollution',
    category: 'Water Pollution',
    urgency: 'Critical',
    status: 'In Progress',
    description: 'Visible oil slick and refuse floating on the lagoon surface near the fish market, threatening local aquatic life and fishermen.',
    date: '03/06 - 11:30',
    address: '1 Ahmadu Bello Way, Victoria Island, Lagos',
    indicator: 'alert',
    photoUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073e0f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 12,
    title: 'Abandoned Waste',
    category: 'Abandoned Waste',
    urgency: 'Very Urgent',
    status: 'Acknowledged',
    description: 'Old mattresses, broken furniture, and construction rubble dumped beside a residential fence blocking the service road.',
    date: '03/06 - 14:05',
    address: '17 Obafemi Awolowo Road, Ikoyi, Lagos',
    indicator: 'sun',
    photoUrl: img12,
  },
];


export default function ReportsPage() {
  const navigate = useNavigate();

  // Filter & Search states
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilters, setActiveCategoryFilters] = useState([]);
  const [activeUrgencyFilters, setActiveUrgencyFilters] = useState([]);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsList, setReportsList] = useState(initialReportsData);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_my_reports');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReportsList([...parsed, ...initialReportsData]);
          return;
        }
      }
    } catch (e) {

    }
    setReportsList(initialReportsData);
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
          <div className="lg:hidden mb-6">
            <div className="flex items-center justify-between gap-2.5">
              {/* Status Dropdown */}
              <div className="relative flex-1 max-w-[200px]">
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="w-full px-3.5 py-2.5 border border-white-stroke rounded-xl text-xs font-semibold bg-white text-black flex items-center justify-between shadow-2xs"
                >
                  <span>{activeTab === 'All' ? 'All Status' : activeTab}</span>
                  <ChevronDown className={`w-4 h-4 text-black-icon transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-white-stroke rounded-xl shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                    {statusTabs.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between ${
                          activeTab === tab ? 'bg-alert-success text-primary font-bold' : 'text-paragraph hover:bg-white-bg'
                        }`}
                      >
                        {tab === 'All' ? 'All Status' : tab}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Icons: Search + Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                  className={`p-2.5 border border-white-stroke rounded-xl bg-white text-black-icon shadow-2xs active:bg-white-bg transition-colors ${
                    isMobileSearchOpen ? 'border-primary text-primary bg-alert-success' : ''
                  }`}
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(true)}
                  className="p-2.5 border border-white-stroke rounded-xl bg-white text-black-icon shadow-2xs active:bg-white-bg transition-colors"
                  aria-label="Filter"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expandable Mobile Search Box */}
            {isMobileSearchOpen && (
              <div className="mt-3 relative animate-in slide-in-from-top duration-150">
                <Search className="w-4 h-4 text-black-icon absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="search for a report..."
                  className="w-full pl-9 pr-4 py-2.5 border border-primary/40 rounded-xl text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-black font-medium placeholder:text-black-placeholder shadow-xs"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Report Cards Grid */}
          {filteredReports.length === 0 ? (
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
                  setSelectedCategory('All Categories');
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
      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 border-t border-white-stroke text-xs text-black-placeholder mt-16 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>Copyright © CleanReport</div>
        <div className="flex items-center gap-4">
          <Link to="#" className="hover:underline">
            Privacy
          </Link>
          <Link to="#" className="hover:underline">
            Terms
          </Link>
          <Link to="#" className="hover:underline">
            Cookies
          </Link>
        </div>
      </footer>
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
