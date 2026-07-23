import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  LayoutGrid, 
  FileText, 
  Gift, 
  User, 
  Download, 
  Search, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import NavbarLogo from './NavbarLogo';
import NotificationBell from './NotificationBell';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const date = new Date();
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    setCurrentDate(date.toLocaleDateString('en-US', options));
  }, []);

  const getUserInfo = () => {
    try {
      const storedUser = (localStorage.getItem('user') || sessionStorage.getItem('user'));
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        const parsed = JSON.parse(storedUser);
        let dName = String(parsed?.authorName || parsed?.displayName || parsed?.name || parsed?.fullName || parsed?.username || (localStorage.getItem('user_name') || sessionStorage.getItem('user_name')) || '');
        const email = String(parsed?.email || (localStorage.getItem('user_email') || sessionStorage.getItem('user_email')) || 'belrah@gmail.com');
        
        if (!dName || dName.trim() === '') {
           if (email && typeof email === 'string' && email.includes('@')) {
               dName = email.split('@')[0].replace(/[._0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();
           } else {
               dName = 'Admin';
           }
        }
        
        return {
          displayName: dName,
          email: email,
          avatarUrl: parsed?.authorAvatarUrl || parsed?.avatarUrl || null,
        };
      }
    } catch (e) {}
    
    let dName = String((localStorage.getItem('user_name') || sessionStorage.getItem('user_name')) || 'Admin');
    const email = String((localStorage.getItem('user_email') || sessionStorage.getItem('user_email')) || 'admin@cleanreport.com');
    
    return {
      displayName: dName,
      email: email,
      avatarUrl: null,
    };
  };

  const userInfo = getUserInfo() || {};
  const displayName = String(userInfo.displayName || 'Admin');
  const avatarUrl = userInfo.avatarUrl || null;

  const handleLogout = () => {
    localStorage.removeItem('access_token'); sessionStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token'); sessionStorage.removeItem('refresh_token');
    localStorage.removeItem('user'); sessionStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', icon: LayoutGrid, path: '/admin/reports' },
    { name: 'Report', icon: FileText, path: '/reports' },
    { name: 'Reward Management', icon: Gift, path: '/rewards' },
    { name: 'Profile', icon: User, path: '/profile' }
  ];

  return (
    <div className="min-h-screen bg-white-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-white-stroke fixed inset-y-0 z-20">
        <div className="p-6">
          <Link to="/" className="flex items-center">
            <NavbarLogo className="h-8 w-auto object-contain" />
          </Link>
        </div>
        
        <div className="px-6 mb-6">
          <button 
            onClick={() => toast.success('Exporting data...')}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl font-bold shadow-sm hover:bg-primary/90 transition-all text-sm"
          >
            Export Data
            <Download className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.name === 'Dashboard' && location.pathname === '/admin');
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive 
                    ? 'bg-alert-successLight text-primary' 
                    : 'text-paragraph hover:bg-white-bg hover:text-black'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-black-icon'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white-stroke">
          <div className="flex items-center justify-between mb-2 cursor-pointer p-2 rounded-xl hover:bg-white-bg transition-colors" onClick={() => navigate('/profile')}>
            <div className="flex items-center gap-3 overflow-hidden">
              <img 
                src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`} 
                alt="Admin profile avatar in sidebar" 
                className="w-10 h-10 rounded-full object-cover shadow-sm border border-white-stroke shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
                }}
              />
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-black truncate">{displayName}</p>
                <p className="text-xs text-paragraph truncate">Product Designer</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-alert-error hover:bg-alert-errorLight rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white border-b border-white-stroke flex items-center justify-between px-4 z-30">
        <Link to="/" className="flex items-center">
          <NavbarLogo className="h-7 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 text-black-icon rounded-lg hover:bg-white-bg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left">
            <div className="p-4 flex items-center justify-between border-b border-white-stroke">
              <NavbarLogo className="h-7 w-auto" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-black-icon">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4">
              <button 
                onClick={() => toast.success('Exporting data...')}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl font-bold shadow-sm"
              >
                Export Data <Download className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.name === 'Dashboard' && location.pathname === '/admin');
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                      isActive ? 'bg-alert-successLight text-primary' : 'text-paragraph'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-black-icon'}`} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 mt-auto border-t border-white-stroke">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-alert-error"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen pt-16 lg:pt-0 overflow-x-hidden">
        {/* Desktop Top Nav */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-white-bg sticky top-0 z-10">
          <div className="flex flex-col">
            <h1 className="text-xl font-heading font-bold text-black mb-0.5">Welcome Back {displayName.split(' ')[0]}!</h1>
            <p className="text-sm font-medium text-paragraph">{currentDate}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black-icon" />
              <input 
                type="text" 
                placeholder="search" 
                aria-label="Search reports"
                className="pl-9 pr-4 py-2 rounded-xl border border-white-stroke bg-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 w-64"
              />
            </div>
            <button className="w-10 h-10 rounded-xl bg-white border border-white-stroke flex items-center justify-center text-black-icon hover:text-black hover:border-black/20 shadow-sm transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="bg-white rounded-xl border border-white-stroke shadow-sm flex items-center justify-center">
              <NotificationBell />
            </div>
            <img 
              src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`} 
              alt="Admin profile avatar in top navbar" 
              className="w-10 h-10 rounded-full object-cover shadow-sm border border-white-stroke shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
              }}
            />
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
