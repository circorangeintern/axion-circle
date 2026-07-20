import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LayoutGrid,
  FileText,
  Gift,
  Smartphone,
  Settings,
  Bell,
  ChevronDown,
  ChevronRight,
  User,
  HelpCircle,
  Palette,
  LogOut,
  Menu,
  X,
  Home,
} from 'lucide-react';
import NavbarLogo from './NavbarLogo';

export default function AppNavbar({ activeTab = '' }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem('access_token');
    return Boolean(token && token !== 'undefined' && token !== 'null');
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(Boolean(token && token !== 'undefined' && token !== 'null'));
  }, [location.pathname]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileUserMenu, setShowMobileUserMenu] = useState(false);

  const getUserInfo = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        const parsed = JSON.parse(storedUser);
        
        let dName = String(parsed?.displayName || parsed?.name || parsed?.fullName || parsed?.username || localStorage.getItem('user_name') || '');
        const email = String(parsed?.email || localStorage.getItem('user_email') || 'belrah@gmail.com');
        
        if (!dName || dName.trim() === '') {
           if (email && typeof email === 'string' && email.includes('@')) {
               dName = email.split('@')[0].replace(/[._0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();
           } else {
               dName = 'there';
           }
        }
        
        return {
          displayName: dName,
          email: email,
          avatarUrl: parsed?.avatarUrl || null,
        };
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    
    let dName = String(localStorage.getItem('user_name') || '');
    const email = String(localStorage.getItem('user_email') || 'belrah@gmail.com');
    if (!dName || dName.trim() === '') {
       if (email && typeof email === 'string' && email.includes('@')) {
           dName = email.split('@')[0].replace(/[._0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();
       } else {
           dName = 'there';
       }
    }
    
    return {
      displayName: dName,
      email: email,
      avatarUrl: null,
    };
  };

  const userInfo = getUserInfo() || {};
  const displayName = String(userInfo.displayName || 'there');
  const email = String(userInfo.email || 'belrah@gmail.com');
  const avatarUrl = userInfo.avatarUrl || null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMobileAppClick = () => {
    toast.success('CleanReport mobile app installation link sent!');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
    setShowMobileUserMenu(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white-stroke bg-white sticky top-0 z-30 shadow-xs">
        <Link to="/" className="flex items-center shrink-0">
          <NavbarLogo className="h-8 sm:h-9 w-auto object-contain" />
        </Link>

        {isLoggedIn && (
          <nav className="flex items-center gap-1.5 p-1 bg-white border border-white-stroke rounded-2xl font-medium text-xs text-paragraph shadow-xs">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-alert-successLight text-primary font-bold'
                  : 'text-paragraph hover:text-black font-semibold'
              }`}
            >
              <LayoutGrid className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' ? 'text-primary' : 'text-black-icon'}`} />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/reports"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-colors ${
                activeTab === 'reports'
                  ? 'bg-alert-successLight text-primary font-bold'
                  : 'text-paragraph hover:text-black font-semibold'
              }`}
            >
              <FileText className={`w-4 h-4 shrink-0 ${activeTab === 'reports' ? 'text-primary' : 'text-black-icon'}`} />
              <span>All Reports</span>
            </Link>
            <Link
              to="/rewards"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-colors ${
                activeTab === 'rewards'
                  ? 'bg-alert-successLight text-primary font-bold'
                  : 'text-paragraph hover:text-black font-semibold'
              }`}
            >
              <Gift className={`w-4 h-4 shrink-0 ${activeTab === 'rewards' ? 'text-primary' : 'text-black-icon'}`} />
              <span>Rewards</span>
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-3 lg:gap-4">
          <button
            type="button"
            onClick={handleMobileAppClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-alert-successStroke bg-alert-successLight text-primary text-xs font-bold hover:bg-alert-successLight/80 transition-colors shrink-0 shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5" /> Use App on Mobile
          </button>

          {!isLoggedIn ? (
            <Link
              to="/register"
              className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm shrink-0"
            >
              Get Started
            </Link>
          ) : (
            <div className="flex items-center gap-3 relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => toast.success('Settings modal coming soon!')}
                className="text-black-icon hover:text-black p-1.5 rounded-lg hover:bg-white-bg transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => toast.success('No new notifications')}
                className="text-black-icon hover:text-black p-1.5 relative rounded-lg hover:bg-white-bg transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-alert-error rounded-full ring-2 ring-white"></span>
              </button>

              <div
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-white-bg transition-colors border border-transparent hover:border-white-stroke"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-alert-success" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shadow-sm ring-2 ring-alert-success">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <ChevronDown className={`w-4 h-4 text-black-icon transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Uniform Desktop Avatar Dropdown Menu across ALL pages */}
              {isMenuOpen && (
                <div className="absolute right-0 top-12 w-60 bg-white border border-white-stroke rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-white-stroke flex items-center gap-3">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover shrink-0 shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-black truncate">{displayName}</p>
                      <p className="text-xs text-black-icon truncate">{email}</p>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-paragraph hover:bg-white-bg flex items-center gap-2.5 transition-colors"
                    >
                      <User className="w-4 h-4 text-black-icon" /> View profile
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsMenuOpen(false); navigate('/my-reports'); }}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-paragraph hover:bg-white-bg flex items-center gap-2.5 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-black-icon" /> My Reports
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsMenuOpen(false); toast.success('Settings coming soon!'); }}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-paragraph hover:bg-white-bg flex items-center gap-2.5 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-black-icon" /> Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsMenuOpen(false); toast.success('Support center coming soon!'); }}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-paragraph hover:bg-white-bg flex items-center gap-2.5 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-black-icon" /> Support
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsMenuOpen(false); toast.success('Theme switcher coming soon!'); }}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-paragraph hover:bg-white-bg flex items-center gap-2.5 transition-colors"
                    >
                      <Palette className="w-4 h-4 text-black-icon" /> Change Theme
                    </button>
                  </div>

                  <div className="border-t border-white-stroke mt-1 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-alert-error hover:bg-alert-errorLight font-semibold flex items-center gap-2.5 transition-colors rounded-b-xl"
                    >
                      <LogOut className="w-4 h-4 text-alert-error" /> Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3.5 border-b border-white-stroke bg-white sticky top-0 z-30 shadow-xs">
        <Link to="/" className="flex items-center shrink-0">
          <NavbarLogo className="h-8 sm:h-9 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(true);
              setShowMobileUserMenu(false);
            }}
            className="text-black-icon hover:text-black p-1.5 rounded-lg active:bg-white-bg transition-colors"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Slide-In Menu Drawer (Logged Out) */}
      {isMobileMenuOpen && !isLoggedIn && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-start">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-5 left-[calc(280px+16px)] sm:left-[calc(320px+16px)] text-white/90 hover:text-white p-1.5 cursor-pointer transition-colors z-50 animate-in fade-in duration-200"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 stroke-[2]" />
          </button>
          <div className="relative w-[280px] sm:w-80 bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div className="p-6 pb-6">
              <Link to="/" className="flex items-center shrink-0">
                <NavbarLogo className="h-8 sm:h-9 w-auto object-contain" />
              </Link>
            </div>

            <div className="mt-auto px-6 pb-8 space-y-3.5">
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-primary text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-primary/90 active:scale-95 transition-all text-sm"
              >
                Get Started
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleMobileAppClick();
                }}
                className="w-full bg-alert-success text-primary border border-primary/20 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 hover:bg-alert-success/80 active:scale-95 transition-all text-sm"
              >
                <Smartphone className="w-4 h-4" /> Use App on Mobile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Slide-In Menu Drawer (Logged In) */}
      {isMobileMenuOpen && isLoggedIn && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-start">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setShowMobileUserMenu(false);
            }}
          ></div>
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setShowMobileUserMenu(false);
            }}
            className="absolute top-5 left-[calc(280px+16px)] sm:left-[calc(320px+16px)] text-white/90 hover:text-white p-1.5 cursor-pointer transition-colors z-50 animate-in fade-in duration-200"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 stroke-[2]" />
          </button>
          <div className="relative w-[280px] sm:w-80 bg-white h-full shadow-2xl flex flex-col justify-between z-10 overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="flex flex-col flex-1">
              <div className="p-6 pb-8">
                <Link to="/" className="flex items-center shrink-0">
                  <NavbarLogo className="h-8 sm:h-9 w-auto object-contain" />
                </Link>
              </div>

              <nav className="px-6 space-y-6">
                <Link
                  to="/"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowMobileUserMenu(false);
                  }}
                  className={`flex items-center gap-3.5 font-bold text-sm transition-colors ${activeTab === 'dashboard' ? 'text-primary' : 'text-black hover:text-primary'}`}
                >
                  <Home className="w-5 h-5 text-black/80 shrink-0" /> Dashboard
                </Link>
                <Link
                  to="/reports"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowMobileUserMenu(false);
                  }}
                  className={`flex items-center gap-3.5 font-bold text-sm transition-colors ${activeTab === 'reports' ? 'text-primary' : 'text-black hover:text-primary'}`}
                >
                  <FileText className="w-5 h-5 text-black/80 shrink-0" /> All Reports
                </Link>
                <Link
                  to="/rewards"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowMobileUserMenu(false);
                  }}
                  className={`flex items-center gap-3.5 font-bold text-sm transition-colors ${activeTab === 'rewards' ? 'text-primary' : 'text-black hover:text-primary'}`}
                >
                  <Gift className="w-5 h-5 text-black/80 shrink-0" /> Rewards
                </Link>
              </nav>

              <div className="mt-auto px-6 space-y-6 mb-6 pt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowMobileUserMenu(false);
                    toast.success('No new notifications');
                  }}
                  className="w-full flex items-center gap-3.5 font-bold text-sm text-black hover:text-primary transition-colors text-left"
                >
                  <Bell className="w-5 h-5 text-black/80 shrink-0" /> Notification
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowMobileUserMenu(false);
                    toast.success('Settings coming soon!');
                  }}
                  className="w-full flex items-center gap-3.5 font-bold text-sm text-black hover:text-primary transition-colors text-left"
                >
                  <Settings className="w-5 h-5 text-black/80 shrink-0" /> Settings
                </button>
              </div>
            </div>

            <div className="mt-auto border-t border-white-stroke">
              {showMobileUserMenu && (
                <div className="p-3 bg-white-bg space-y-1 border-b border-white-stroke animate-in slide-in-from-bottom duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowMobileUserMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs sm:text-sm text-paragraph hover:bg-white-bg2 rounded-lg font-medium transition-colors"
                  >
                    <User className="w-4 h-4 text-black-icon shrink-0" /> View profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowMobileUserMenu(false);
                      navigate('/my-reports');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs sm:text-sm text-paragraph hover:bg-white-bg2 rounded-lg font-medium transition-colors"
                  >
                    <FileText className="w-4 h-4 text-black-icon shrink-0" /> My Reports
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowMobileUserMenu(false);
                      toast.success('Support coming soon!');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs sm:text-sm text-paragraph hover:bg-white-bg2 rounded-lg font-medium transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-black-icon shrink-0" /> Support
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowMobileUserMenu(false);
                      toast.success('Theme switcher coming soon!');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs sm:text-sm text-paragraph hover:bg-white-bg2 rounded-lg font-medium transition-colors"
                  >
                    <Palette className="w-4 h-4 text-black-icon shrink-0" /> Change Theme
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileUserMenu(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs sm:text-sm text-alert-error hover:bg-alert-errorLight rounded-lg font-bold transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4 text-alert-error shrink-0" /> Log out
                  </button>
                </div>
              )}

              <div
                onClick={() => setShowMobileUserMenu(!showMobileUserMenu)}
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white-bg transition-colors shrink-0"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover shrink-0 shadow-xs ring-1 ring-white-stroke" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center shrink-0 shadow-xs text-sm ring-1 ring-white-stroke">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-black truncate">{displayName}</p>
                    <p className="text-xs text-black-icon truncate">{email}</p>
                  </div>
                </div>
                {showMobileUserMenu ? (
                  <ChevronDown className="w-4 h-4 text-black-icon shrink-0 rotate-180 transition-transform duration-200" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-black-icon shrink-0 transition-transform duration-200" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
