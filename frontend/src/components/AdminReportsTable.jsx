import { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp,
  Search, 
  Filter, 
  Trash2, 
  Droplet, 
  Zap, 
  X,
  MoreVertical,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const urgencyConfig = {
  high: { bg: 'bg-alert-errorLight', text: 'text-alert-error' },
  medium: { bg: 'bg-alert-warningLight', text: 'text-alert-warning' },
  low: { bg: 'bg-alert-successLight', text: 'text-alert-success' }
};

const statusConfig = {
  resolved: { bg: 'bg-alert-successLight', text: 'text-primary', label: 'Resolved' },
  'in progress': { bg: 'bg-alert-inprogressLight', text: 'text-alert-inprogress', label: 'In Progress' },
  inprogress: { bg: 'bg-alert-inprogressLight', text: 'text-alert-inprogress', label: 'In Progress' },
  acknowledged: { bg: 'bg-alert-infoLight', text: 'text-alert-info', label: 'Acknowledged' },
  reported: { bg: 'bg-alert-warningLight', text: 'text-accent', label: 'Reported' },
  pending: { bg: 'bg-alert-warningLight', text: 'text-accent', label: 'Pending' }
};

const getCategoryIcon = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('waste') || cat.includes('dump')) return <Trash2 className="w-4 h-4 text-primary" />;
  if (cat.includes('water') || cat.includes('drain') || cat.includes('plumbing')) return <Droplet className="w-4 h-4 text-[#3b82f6]" />;
  if (cat.includes('light') || cat.includes('electricity')) return <Zap className="w-4 h-4 text-[#f59e0b]" />;
  return <FileText className="w-4 h-4 text-paragraph" />;
};

export default function AdminReportsTable({ reports, onRefresh }) {
  const [sortColumn, setSortColumn] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const openStatusModal = (report) => {
    setSelectedReport(report);
    setNewStatus(report.status || 'REPORTED');
    setNote('');
    setModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedReport) return;
    try {
      setIsUpdating(true);
      await api.put(`/reports/${selectedReport.id}/status`, {
        status: newStatus,
        note: note
      });
      toast.success('Status updated successfully');
      setModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredAndSortedReports = useMemo(() => {
    let result = [...reports];

    // Filter by Status
    if (filterStatus !== 'All Status') {
      result = result.filter(r => (r.status || 'Reported').toLowerCase() === filterStatus.toLowerCase());
    }

    // Filter by Category
    if (filterCategory !== 'All Categories') {
      result = result.filter(r => (r.category || '').toLowerCase() === filterCategory.toLowerCase());
    }

    // Sort
    result.sort((a, b) => {
      let aVal, bVal;
      switch (sortColumn) {
        case 'category':
          aVal = (a.category || '').toLowerCase();
          bVal = (b.category || '').toLowerCase();
          break;
        case 'reference':
          aVal = a.id || '';
          bVal = b.id || '';
          break;
        case 'urgency':
          aVal = (a.urgency || 'medium').toLowerCase();
          bVal = (b.urgency || 'medium').toLowerCase();
          break;
        case 'area':
          aVal = (a.areaName || a.address || '').toLowerCase();
          bVal = (b.areaName || b.address || '').toLowerCase();
          break;
        case 'date':
          aVal = new Date(a.createdAt || a.date || 0).getTime();
          bVal = new Date(b.createdAt || b.date || 0).getTime();
          break;
        case 'status':
          aVal = (a.status || '').toLowerCase();
          bVal = (b.status || '').toLowerCase();
          break;
        default:
          aVal = ''; bVal = '';
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [reports, sortColumn, sortDirection, filterStatus, filterCategory]);

  const totalPages = Math.ceil(filteredAndSortedReports.length / itemsPerPage) || 1;
  const paginatedReports = filteredAndSortedReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return <ChevronDown className="w-3 h-3 text-paragraph opacity-50" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  return (
    <div className="bg-white border border-white-stroke rounded-2xl shadow-sm flex flex-col">
      {/* Table Header / Filters */}
      <div className="p-4 sm:p-5 border-b border-white-stroke flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-heading font-bold text-lg text-black">Recent Reports</h2>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select 
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-white border border-white-stroke rounded-lg text-sm font-medium text-black outline-none focus:border-primary shadow-sm"
          >
            <option>All Status</option>
            <option>Reported</option>
            <option>Acknowledged</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          <select 
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-white border border-white-stroke rounded-lg text-sm font-medium text-black outline-none focus:border-primary shadow-sm"
          >
            <option>All Categories</option>
            <option>Waste Management</option>
            <option>Plumbing Issue</option>
            <option>Street Lighting</option>
            <option>Sanitation Issue</option>
          </select>
          <button className="px-3 py-2 bg-white border border-white-stroke rounded-lg text-sm font-medium text-black flex items-center gap-2 hover:bg-white-bg shadow-sm">
            <Filter className="w-4 h-4 text-black-icon" /> Advanced Filter
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white-bg2 border-b border-white-stroke text-xs font-semibold text-paragraph">
              <th className="px-5 py-3 cursor-pointer whitespace-nowrap" onClick={() => handleSort('category')}>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 rounded border-white-stroke text-primary focus:ring-primary" />
                  Category <SortIcon column="category" />
                </div>
              </th>
              <th className="px-5 py-3 cursor-pointer whitespace-nowrap" onClick={() => handleSort('reference')}>
                <div className="flex items-center gap-1">Reference ID <SortIcon column="reference" /></div>
              </th>
              <th className="px-5 py-3 cursor-pointer whitespace-nowrap" onClick={() => handleSort('urgency')}>
                <div className="flex items-center gap-1">Urgency <SortIcon column="urgency" /></div>
              </th>
              <th className="px-5 py-3 cursor-pointer whitespace-nowrap" onClick={() => handleSort('area')}>
                <div className="flex items-center gap-1">Area <SortIcon column="area" /></div>
              </th>
              <th className="px-5 py-3 cursor-pointer whitespace-nowrap" onClick={() => handleSort('date')}>
                <div className="flex items-center gap-1">Date Reported <SortIcon column="date" /></div>
              </th>
              <th className="px-5 py-3 cursor-pointer whitespace-nowrap" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">Status <SortIcon column="status" /></div>
              </th>
              <th className="px-5 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white-stroke text-sm">
            {paginatedReports.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-8 text-center text-paragraph">No reports found matching criteria</td>
              </tr>
            ) : (
              paginatedReports.map((report) => {
                const s = (report.status || 'Reported').toLowerCase();
                const statusTheme = statusConfig[s] || statusConfig.reported;
                
                const u = (report.urgency || 'medium').toLowerCase();
                const urgencyTheme = urgencyConfig[u] || urgencyConfig.medium;

                const rawDate = report.createdAt || report.date;
                const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown';

                const catName = report.category ? report.category.replace(/_/g, ' ') : (report.title || 'Sanitation Issue');

                return (
                  <tr key={report.id} className="hover:bg-white-bg/50 transition-colors bg-white">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4 rounded border-white-stroke text-primary focus:ring-primary" />
                        <div className="w-8 h-8 rounded-full bg-white-bg2 border border-white-stroke flex items-center justify-center shrink-0">
                          {getCategoryIcon(catName)}
                        </div>
                        <span className="font-bold text-black capitalize">{catName.toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-black-icon">
                      {report.id ? report.id.substring(0, 8).toUpperCase() : 'N/A'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${urgencyTheme.bg} ${urgencyTheme.text}`}>
                        {report.urgency || 'Medium'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-black font-medium">
                      {report.areaName || report.address || 'Unknown'}
                    </td>
                    <td className="px-5 py-4 text-paragraph font-medium">
                      {formattedDate}
                    </td>
                    <td className="px-5 py-4">
                      <button 
                        onClick={() => openStatusModal(report)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer hover:opacity-80 transition-opacity ${statusTheme.bg} ${statusTheme.text} ${statusTheme.bg.replace('bg-', 'border-').replace('Light', 'Stroke')}`}
                      >
                        {statusTheme.label}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => openStatusModal(report)}
                          className="p-1.5 text-paragraph hover:text-primary bg-white-bg hover:bg-primary/10 rounded-lg transition-colors"
                          title="Update Status"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 sm:p-5 border-t border-white-stroke flex items-center justify-between">
        <span className="text-sm font-medium text-paragraph">
          Showing <span className="font-bold text-black">{paginatedReports.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-bold text-black">{Math.min(currentPage * itemsPerPage, filteredAndSortedReports.length)}</span> of <span className="font-bold text-black">{filteredAndSortedReports.length}</span> entries
        </span>
        <div className="flex items-center gap-1.5">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="px-3 py-1.5 rounded-lg border border-white-stroke text-sm font-semibold text-black hover:bg-white-bg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          
          <div className="flex items-center gap-1 hidden sm:flex">
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              if (
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                      currentPage === page 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-paragraph hover:bg-white-bg'
                    }`}
                  >
                    {page}
                  </button>
                );
              }
              if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="text-paragraph">...</span>;
              }
              return null;
            })}
          </div>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="px-3 py-1.5 rounded-lg border border-white-stroke text-sm font-semibold text-black hover:bg-white-bg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Status Update Modal */}
      {modalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-white-stroke flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-black">Update Report Status</h3>
              <button onClick={() => setModalOpen(false)} className="text-black-icon hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="p-3 bg-white-bg2 border border-white-stroke rounded-xl flex flex-col gap-1">
                <span className="text-xs font-semibold text-paragraph">Report ID</span>
                <span className="text-sm font-bold text-black">{selectedReport.id}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-black">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-white-stroke rounded-xl text-sm font-medium text-black focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                >
                  <option value="REPORTED">Reported</option>
                  <option value="ACKNOWLEDGED">Acknowledged</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
                <p className="text-[11px] text-paragraph leading-tight mt-1">
                  Transitions must go forward (Reported → Acknowledged → In Progress → Resolved).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-black">Note (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Explain why the status is changing..."
                  className="w-full px-4 py-3 bg-white border border-white-stroke rounded-xl text-sm font-medium text-black focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 min-h-[100px] resize-y"
                  maxLength={500}
                ></textarea>
              </div>
            </div>

            <div className="p-5 border-t border-white-stroke bg-white-bg flex gap-3">
              <button 
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 bg-white border border-white-stroke rounded-xl text-sm font-bold text-black hover:bg-white-bg2 transition-colors"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button 
                onClick={handleStatusUpdate}
                disabled={isUpdating}
                className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
