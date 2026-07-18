import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Users
} from 'lucide-react';
import AppNavbar from '../components/AppNavbar';
import mapBg from '../assets/map-bg.jpg';

export default function HomePage() {
  const navigate = useNavigate();

  // Check localStorage for access_token to determine logged-in state for Hero section display
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('access_token')));
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

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
        const fullName = String(parsed?.fullName || parsed?.username || localStorage.getItem('user_name') || '');
        return fullName.split(' ')[0] || 'there';
      }
    } catch (e) {}
    return 'there';
  };

  const firstName = getUserFirstName();

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
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-paragraph">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> High Density
                  </div>
                </div>

                {/* Map Area (Edge to Edge) */}
                <div 
                  className="w-full h-80 sm:h-[380px] bg-[#f0ede5] relative overflow-hidden flex items-center justify-center bg-cover bg-center"
                  style={{ backgroundImage: `url(${mapBg})` }}
                >
                  {/* Map Overlay to slightly wash out the background and improve contrast for UI elements */}
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>

                  {/* Glowing Heatmap Dots */}
                  {[
                    { t: '20%', l: '35%', s: 'w-16 h-16' },
                    { t: '45%', l: '48%', s: 'w-20 h-20' },
                    { t: '35%', l: '20%', s: 'w-12 h-12' },
                    { t: '65%', l: '25%', s: 'w-24 h-24' },
                    { t: '75%', l: '45%', s: 'w-14 h-14' },
                    { t: '55%', l: '60%', s: 'w-16 h-16' },
                    { t: '30%', l: '65%', s: 'w-12 h-12' },
                    { t: '70%', l: '70%', s: 'w-16 h-16' },
                  ].map((pos, i) => (
                    <div key={i} className={`absolute top-[${pos.t}] left-[${pos.l}] ${pos.s} rounded-full bg-[#22c55e]/30 blur-md flex items-center justify-center animate-pulse`} style={{ top: pos.t, left: pos.l }}>
                      <div className="w-1.5 h-1.5 bg-white/90 rounded-full blur-[1px]"></div>
                    </div>
                  ))}

                  {/* Left Sidebar Overlay */}
                  <div className="absolute top-0 left-0 bottom-0 w-[140px] bg-white/95 backdrop-blur-md border-r border-white-stroke py-3 hidden sm:flex flex-col z-10">
                     <div className="px-4 py-2 bg-[#f0f5f4] text-primary font-bold text-[10px] flex items-center gap-2 border-l-2 border-primary">
                       <Home className="w-3.5 h-3.5" /> Overview
                     </div>
                     <div className="px-4 py-2 text-paragraph font-medium text-[10px] flex items-center gap-2 hover:bg-white-bg cursor-pointer transition-colors">
                       <FileText className="w-3.5 h-3.5" /> Reports
                     </div>
                     <div className="px-4 py-2 text-paragraph font-medium text-[10px] flex items-center gap-2 hover:bg-white-bg cursor-pointer transition-colors">
                       <Activity className="w-3.5 h-3.5" /> Analytics
                     </div>
                     <div className="px-4 py-2 text-paragraph font-medium text-[10px] flex items-center gap-2 hover:bg-white-bg cursor-pointer transition-colors">
                       <Settings className="w-3.5 h-3.5" /> Settings
                     </div>
                     <div className="px-4 py-2 text-paragraph font-medium text-[10px] flex items-center gap-2 hover:bg-white-bg cursor-pointer transition-colors">
                       <Layers className="w-3.5 h-3.5" /> Map Layers
                     </div>
                     <div className="px-4 py-2 text-paragraph font-medium text-[10px] flex items-center gap-2 hover:bg-white-bg cursor-pointer transition-colors">
                       <Users className="w-3.5 h-3.5" /> Community Feed
                     </div>
                  </div>

                  {/* Right Activity Feed Overlay */}
                  <div className="absolute top-0 right-0 bottom-0 w-[200px] bg-white/95 backdrop-blur-md border-l border-white-stroke p-3 z-10 hidden sm:flex flex-col">
                    <h4 className="text-[8px] font-bold text-black tracking-wider uppercase mb-3">Activity Feed - Downtown District</h4>
                    
                    <div className="flex flex-col gap-3">
                      <div className="text-[8px] leading-relaxed text-paragraph">
                        Report #4521: Street Light Outage - Main St & 5th Ave (2m ago) <span className="text-primary font-bold">[RESOLVED]</span>
                      </div>
                      <div className="text-[8px] leading-relaxed text-paragraph">
                        Report #4520: Pothole - Oak Rd & 10th St (5m ago) <span className="text-[#d97706] font-bold">[PENDING]</span>
                      </div>
                      <div className="text-[8px] leading-relaxed text-paragraph">
                        Report #4519: Graffiti - Central Park Path (15m ago) <span className="text-primary font-bold">[IN PROGRESS]</span>
                      </div>
                      <div className="text-[8px] leading-relaxed text-paragraph">
                        Report #4518: Waste Collection Issue - Elm Alley (32m ago) <span className="text-primary font-bold">[RESOLVED]</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-t border-white-stroke flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-[7px] font-bold text-paragraph uppercase tracking-wider">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_4px_#058743]"></span> Report Activity
                      </div>
                      <div className="flex items-center gap-1.5 text-[7px] font-bold text-paragraph uppercase tracking-wider">
                        <span className="w-2 h-2 bg-[#d1e6d3] border border-[#a8c9ac]"></span> Parks
                      </div>
                      <div className="flex items-center gap-1.5 text-[7px] font-bold text-paragraph uppercase tracking-wider">
                        <span className="w-2 h-[2px] bg-[#cbd5e1]"></span> Streets
                      </div>
                      <div className="flex items-center gap-1.5 text-[7px] font-bold text-paragraph uppercase tracking-wider">
                        <span className="w-2 h-2 bg-[#94a3b8]"></span> Buildings
                      </div>
                    </div>
                  </div>

                  {/* Bottom Left District Overview Overlay */}
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-white border border-white-stroke rounded-lg p-3 sm:p-4 w-[200px] sm:w-[240px] shadow-lg z-20">
                    <h3 className="font-bold text-[11px] sm:text-xs text-black mb-1.5">District Overview</h3>
                    <p className="text-[9px] sm:text-[10px] text-paragraph leading-relaxed">
                      Most reports currently localized in North Sector (Road Maintenance). 4 new reports in last hour.
                    </p>
                  </div>
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
                    {/* Row 1 — Inprogress */}
                    <div className="py-3 flex flex-col justify-center first:pt-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="bg-alert-inprogressLight text-alert-inprogress border border-alert-inprogressStroke px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          Inprogress
                        </span>
                        <span className="text-[11px] text-black-placeholder">Oct 12, 2023</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-black">Overflowing Waste drum</h3>
                      <div className="flex items-center gap-1 text-[11px] text-black-icon mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>Cole Street 5th Ave, Lagos Island</span>
                      </div>
                    </div>

                    {/* Row 2 — Resolved */}
                    <div className="py-3 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="bg-alert-successLight text-primary border border-alert-successStroke px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          Resolved
                        </span>
                        <span className="text-[11px] text-black-placeholder">Oct 12, 2023</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-black">Overflowing Waste drum</h3>
                      <div className="flex items-center gap-1 text-[11px] text-black-icon mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>Cole Street 5th Ave, Lagos Island</span>
                      </div>
                    </div>

                    {/* Row 3 — Acknowledged */}
                    <div className="py-3 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="bg-alert-infoLight text-alert-info border border-alert-infoStroke px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          Acknowledged
                        </span>
                        <span className="text-[11px] text-black-placeholder">Oct 12, 2023</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-black">Overflowing Waste drum</h3>
                      <div className="flex items-center gap-1 text-[11px] text-black-icon mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>Cole Street 5th Ave, Lagos Island</span>
                      </div>
                    </div>

                    {/* Row 4 — Reported */}
                    <div className="py-3 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="bg-alert-warningLight text-accent border border-alert-warningStroke px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          Reported
                        </span>
                        <span className="text-[11px] text-black-placeholder">Oct 12, 2023</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-black">Overflowing Waste drum</h3>
                      <div className="flex items-center gap-1 text-[11px] text-black-icon mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>Cole Street 5th Ave, Lagos Island</span>
                      </div>
                    </div>

                    {/* Row 5 — Reported */}
                    <div className="py-3 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="bg-alert-warningLight text-accent border border-alert-warningStroke px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          Reported
                        </span>
                        <span className="text-[11px] text-black-placeholder">Oct 12, 2023</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-black">Overflowing Waste drum</h3>
                      <div className="flex items-center gap-1 text-[11px] text-black-icon mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>Cole Street 5th Ave, Lagos Island</span>
                      </div>
                    </div>

                    {/* Row 6 — Resolved (matches Figma 6th row) */}
                    <div className="py-3 flex flex-col justify-center last:pb-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="bg-alert-successLight text-primary border border-alert-successStroke px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          Resolved
                        </span>
                        <span className="text-[11px] text-black-placeholder">Oct 12, 2023</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-black">Overflowing Waste drum</h3>
                      <div className="flex items-center gap-1 text-[11px] text-black-icon mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>Cole Street 5th Ave, Lagos Island</span>
                      </div>
                    </div>
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

      {/* Mobile Floating Action Button (FAB) only shown when logged out or fast action needed */}
      {!isLoggedIn && (
        <div className="md:hidden fixed bottom-4 right-4 z-40">
          <Link
            to="/report"
            className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
            aria-label="New Report"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </div>
      )}

      {/* Local Development Quick Preview Toggle (Only visible in Dev mode) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 z-30">
          <button
            type="button"
            onClick={() => {
              if (isLoggedIn) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                setIsLoggedIn(false);
                toast.success('Previewing: Logged Out View');
                setTimeout(() => window.location.reload(), 200);
              } else {
                localStorage.setItem('access_token', 'demo-jwt-token-123');
                localStorage.setItem('user', JSON.stringify({ fullName: 'Demo User', email: 'demo@example.com' }));
                setIsLoggedIn(true);
                toast.success('Previewing: Logged In View (Demo User)');
                setTimeout(() => window.location.reload(), 200);
              }
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/95 backdrop-blur-md text-white font-semibold text-xs shadow-xl border border-white/20 hover:scale-105 active:scale-95 transition-all"
          >
            <span className={`w-2 h-2 rounded-full ${isLoggedIn ? 'bg-primary animate-pulse' : 'bg-accent'}`}></span>
            <span>{isLoggedIn ? 'Demo: Logged In (Click to Log Out)' : 'Demo: Logged Out (Click to Log In)'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
