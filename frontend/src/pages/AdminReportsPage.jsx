import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Timer,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import RegionalActivityMap from '../components/RegionalActivityMap';
import AdminReportsTable from '../components/AdminReportsTable';
import ReportListView from '../components/ReportListView';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('loading');

  const fetchAdminReports = async () => {
    try {
      setStatus('loading');
      // Fetch from admin endpoint
      const res = await api.get('/admin/reports');
      const content = res.data?.data?.content || [];
      const apiReports = Array.isArray(content) ? content : [];
      
      // We will apply the same jitter as HomePage for the map
      const lagosLat = 6.5244;
      const lagosLng = 3.3792;
      const coordMap = new Map();
      const allReports = [...apiReports].map((r) => {
        let lat = r.latitude ? parseFloat(r.latitude) : lagosLat;
        let lng = r.longitude ? parseFloat(r.longitude) : lagosLng;
        
        const key = `${lat},${lng}`;
        const count = coordMap.get(key) || 0;
        coordMap.set(key, count + 1);

        let jitterLat = 0;
        let jitterLng = 0;
        if (count > 0) {
          jitterLat = Math.sin(count * 1234) * 0.0003;
          jitterLng = Math.cos(count * 1234) * 0.0003;
        }
        
        return {
          ...r,
          latitude: lat + jitterLat,
          longitude: lng + jitterLng,
          rawDate: r.createdAt ? new Date(r.createdAt).getTime() : (r.date ? 0 : Date.now())
        };
      });
      
      allReports.sort((a, b) => (b.rawDate || 0) - (a.rawDate || 0));
      setReports(allReports);
      setStatus('success');
    } catch (err) {
      console.error('Failed to fetch admin reports', err);
      if (err.response && (err.response.status === 403 || err.response.status === 401)) {
        setStatus('forbidden');
      } else {
        setStatus('error');
      }
    }
  };

  useEffect(() => {
    fetchAdminReports();
  }, []);

  const totalReports = reports.length;
  const resolvedReports = reports.filter(r => (r.status || '').toLowerCase() === 'resolved').length;
  const pendingReports = reports.filter(r => ['reported', 'pending'].includes((r.status || '').toLowerCase())).length;

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        
        {/* System Overview Section */}
        <div>
          <h2 className="font-heading font-bold text-lg sm:text-xl text-black mb-4">System Overview</h2>
          <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-4 gap-4 pb-2 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            
            {/* 1. Total Reports */}
            <div className="bg-white border border-white-stroke rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[140px] w-[85vw] sm:w-[240px] md:w-auto shrink-0 snap-center">
              <div className="absolute bottom-0 right-0 w-2/3 h-16 pointer-events-none opacity-60">
                <svg viewBox="0 0 120 48" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,40 Q30,32 50,22 T90,10 T120,4 L120,48 L0,48 Z" fill="#E9FFEA" />
                  <path d="M0,40 Q30,32 50,22 T90,10 T120,4" fill="none" stroke="#127C2F" strokeWidth="1.5" strokeOpacity="0.4" />
                </svg>
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#006FED] flex items-center justify-center text-white shadow-sm shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-black">Total Reports</span>
                </div>
                <button className="text-black-icon hover:text-black shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-baseline gap-3 mt-auto relative z-10">
                <span className="text-[28px] font-bold text-black tracking-tight leading-none">{status === 'loading' ? '...' : totalReports}</span>
                <span className="inline-flex items-center gap-0.5 text-primary text-xs font-bold">
                  <ArrowUpRight className="w-3.5 h-3.5" /> 40%
                </span>
              </div>
            </div>

            {/* 2. Resolved Reports */}
            <div className="bg-white border border-white-stroke rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[140px] w-[85vw] sm:w-[240px] md:w-auto shrink-0 snap-center">
              <div className="absolute bottom-0 right-0 w-2/3 h-16 pointer-events-none opacity-60">
                <svg viewBox="0 0 120 48" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,10 Q30,18 55,28 T90,36 T120,30 L120,48 L0,48 Z" fill="#FFE8E8" />
                  <path d="M0,10 Q30,18 55,28 T90,36 T120,30" fill="none" stroke="#DB0404" strokeWidth="1.5" strokeOpacity="0.4" />
                </svg>
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-black">Resolved Reports</span>
                </div>
                <button className="text-black-icon hover:text-black shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-baseline gap-3 mt-auto relative z-10">
                <span className="text-[28px] font-bold text-black tracking-tight leading-none">{status === 'loading' ? '...' : resolvedReports}</span>
                <span className="inline-flex items-center gap-0.5 text-alert-error text-xs font-bold">
                  <ArrowDownRight className="w-3.5 h-3.5" /> 10%
                </span>
              </div>
            </div>

            {/* 3. Pending Reports */}
            <div className="bg-white border border-white-stroke rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[140px] w-[85vw] sm:w-[240px] md:w-auto shrink-0 snap-center">
              <div className="absolute bottom-0 right-0 w-2/3 h-16 pointer-events-none opacity-60">
                <svg viewBox="0 0 120 48" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,20 Q30,15 50,30 T90,20 T120,10 L120,48 L0,48 Z" fill="#FFF4E5" />
                  <path d="M0,20 Q30,15 50,30 T90,20 T120,10" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.4" />
                </svg>
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F59E0B] flex items-center justify-center text-white shadow-sm shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-black">Pending Reports</span>
                </div>
                <button className="text-black-icon hover:text-black shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-baseline gap-3 mt-auto relative z-10">
                <span className="text-[28px] font-bold text-black tracking-tight leading-none">{status === 'loading' ? '...' : pendingReports}</span>
                <span className="inline-flex items-center gap-0.5 text-primary text-xs font-bold">
                  <ArrowUpRight className="w-3.5 h-3.5" /> 5%
                </span>
              </div>
            </div>

            {/* 4. Avg Response Time */}
            <div className="bg-white border border-white-stroke rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[140px] w-[85vw] sm:w-[240px] md:w-auto shrink-0 snap-center">
              <div className="absolute bottom-0 right-0 w-2/3 h-16 pointer-events-none opacity-60">
                <svg viewBox="0 0 120 48" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,30 Q30,25 50,35 T90,20 T120,15 L120,48 L0,48 Z" fill="#F3F4F6" />
                  <path d="M0,30 Q30,25 50,35 T90,20 T120,15" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeOpacity="0.4" />
                </svg>
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-paragraph flex items-center justify-center text-white shadow-sm shrink-0">
                    <Timer className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-black">Avg Response Time</span>
                </div>
                <button className="text-black-icon hover:text-black shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-baseline gap-3 mt-auto relative z-10">
                <span className="text-[28px] font-bold text-black tracking-tight leading-none">2.4h</span>
                <span className="inline-flex items-center gap-0.5 text-primary text-xs font-bold">
                  <ArrowUpRight className="w-3.5 h-3.5" /> 12%
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Map and Recent Report Side List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col">
            <RegionalActivityMap reports={reports} mapStatus={status} onRetry={fetchAdminReports} />
          </div>
          <div className="lg:col-span-4 flex flex-col">
            <div className="bg-white border border-white-stroke rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between flex-1 h-[440px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-base sm:text-lg text-black">Recent Report</h2>
                <button className="text-xs sm:text-sm font-semibold text-primary hover:underline">view all</button>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0 relative">
                {status === 'loading' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="text-sm font-semibold text-paragraph">Loading...</span>
                  </div>
                )}
                {status === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-8 h-8 text-paragraph mb-2" />
                    <p className="text-sm text-paragraph mb-4">Backend is asleep or offline</p>
                    <button onClick={fetchAdminReports} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-primary/90">
                      <RefreshCw className="w-4 h-4" /> Retry
                    </button>
                  </div>
                )}
                {status === 'forbidden' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <AlertCircle className="w-8 h-8 text-alert-error mb-2" />
                    <p className="text-sm text-alert-error font-bold mb-1">Access Denied</p>
                    <p className="text-xs text-paragraph mb-4">Only administrators can view these reports.</p>
                  </div>
                )}
                {status === 'success' && (
                  <div className="h-full relative z-10 -mx-4 px-4">
                    <ReportListView reports={reports.slice(0, 10)} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* The Main Table */}
        <div className="pb-8">
          <AdminReportsTable reports={reports} onRefresh={fetchAdminReports} />
        </div>

      </div>
    </AdminLayout>
  );
}
