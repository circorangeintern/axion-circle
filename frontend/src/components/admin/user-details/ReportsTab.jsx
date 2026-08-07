import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ArrowLeft, ArrowRight, ArrowDown } from 'lucide-react';
import api from '../../../services/api';

export default function ReportsTab({ userId }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fallback mock data since the specific user reports admin endpoint might not exist yet
  const mockReports = [
    { id: '550e8400-e29b-41d4-a716-446655440001', referenceNumber: 'CR-10208', category: 'BLOCKED_DRAIN', address: '15 Greenway Drive, Lekki, Lagos', createdAt: '2026-02-23T10:00:00Z', status: 'IN_PROGRESS' },
    { id: '550e8400-e29b-41d4-a716-446655440002', referenceNumber: 'CR-10209', category: 'ILLEGAL_DUMPING', address: '22 Maple Street, Victoria Island, Lagos', createdAt: '2026-02-24T10:00:00Z', status: 'REPORTED' },
    { id: '550e8400-e29b-41d4-a716-446655440003', referenceNumber: 'CR-10210', category: 'OVERFLOW', address: '30 Ocean Breeze, Ikoyi, Lagos', createdAt: '2026-02-25T10:00:00Z', status: 'RESOLVED' },
    { id: '550e8400-e29b-41d4-a716-446655440004', referenceNumber: 'CR-10211', category: 'BLOCKED_DRAIN', address: '45 Sunset Boulevard, Surulere, Lagos', createdAt: '2026-02-26T10:00:00Z', status: 'RESOLVED' },
    { id: '550e8400-e29b-41d4-a716-446655440005', referenceNumber: 'CR-10212', category: 'COMMERCIAL_DUMP', address: '78 Riverside Road, Yaba, Lagos', createdAt: '2026-02-27T10:00:00Z', status: 'ACKNOWLEDGED' },
    { id: '550e8400-e29b-41d4-a716-446655440006', referenceNumber: 'CR-10213', category: 'STREET_LITTER', address: '101 Hillside Crescent, Apapa, Lagos', createdAt: '2026-02-28T10:00:00Z', status: 'REJECTED' },
  ];

  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        setLoading(true);
        // Attempt to fetch if endpoint exists, otherwise use mock
        // const res = await api.get(`/admin/users/${userId}/reports`, { params: { page, size: 6 } });
        // setReports(res.data.data.content);
        // setTotalPages(res.data.data.totalPages);
        
        // Simulating API call
        setTimeout(() => {
          setReports(mockReports);
          setTotalPages(10); // Mock pagination
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Failed to fetch user reports', err);
        setLoading(false);
      }
    };
    
    fetchUserReports();
  }, [userId, page]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN_PROGRESS': return 'text-[#8B5CF6]';
      case 'REPORTED': return 'text-[#F59E0B]'; // pending in design
      case 'RESOLVED': return 'text-[#10B981]'; // approved in design
      case 'ACKNOWLEDGED': return 'text-[#3B82F6]';
      case 'REJECTED': return 'text-[#EF4444]';
      default: return 'text-[#6B7280]';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'IN_PROGRESS': return 'In Progress';
      case 'REPORTED': return 'Pending';
      case 'RESOLVED': return 'Approved';
      case 'ACKNOWLEDGED': return 'Acknowledged';
      case 'REJECTED': return 'Rejected';
      default: return status;
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-[#8B5CF6]';
      case 'REPORTED': return 'bg-[#F59E0B]'; 
      case 'RESOLVED': return 'bg-[#10B981]'; 
      case 'ACKNOWLEDGED': return 'bg-[#3B82F6]';
      case 'REJECTED': return 'bg-[#EF4444]';
      default: return 'bg-[#6B7280]';
    }
  };

  const formatCategory = (cat) => {
    return cat.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="bg-white border border-white-stroke rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 border-b border-white-stroke flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg text-[#1F2937]">Reports Submitted</h2>
        <Link to="/admin/reports" className="text-[#127C2F] text-sm font-semibold hover:underline">
          View in Report
        </Link>
      </div>
      
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-white-stroke text-xs font-semibold text-paragraph h-[44px]">
              <th className="px-5 py-3 whitespace-nowrap">Reports ID</th>
              <th className="px-5 py-3 whitespace-nowrap">Category</th>
              <th className="px-5 py-3 whitespace-nowrap">Location</th>
              <th className="px-5 py-3 whitespace-nowrap">Date</th>
              <th className="px-5 py-3 cursor-pointer whitespace-nowrap">
                <div className="flex items-center gap-1">Status <ArrowDown className="w-3 h-3 text-paragraph" /></div>
              </th>
              <th className="px-5 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white-stroke text-sm">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-5 py-12 text-center">
                  <div className="flex justify-center items-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-12 text-center text-paragraph">
                  No reports found for this user.
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="hover:bg-white-bg/50 transition-colors bg-white h-[72px]">
                  <td className="px-5 py-4 font-bold text-[#1F2937] text-sm whitespace-nowrap">
                    {report.referenceNumber}
                  </td>
                  <td className="px-5 py-4 text-[#4B5563] text-sm whitespace-nowrap">
                    {formatCategory(report.category)}
                  </td>
                  <td className="px-5 py-4 text-[#4B5563] text-sm max-w-[250px] truncate">
                    {report.address}
                  </td>
                  <td className="px-5 py-4 text-[#4B5563] text-sm whitespace-nowrap">
                    {new Date(report.createdAt).toISOString().split('T')[0]}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDotColor(report.status)}`}></span>
                      <span className={`text-xs font-bold ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Link 
                      to={`/admin/reports/${report.id}`}
                      className="p-1.5 text-black-icon hover:text-primary transition-colors focus:outline-none inline-block"
                      title="View Report"
                      aria-label={`View report ${report.referenceNumber}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      {!loading && reports.length > 0 && (
        <div className="p-5 border-t border-white-stroke flex items-center justify-between">
          <button 
            disabled={page === 0}
            onClick={() => setPage(Math.max(0, page - 1))}
            className="flex items-center gap-2 px-4 py-2 border border-white-stroke rounded-xl text-sm font-semibold text-black hover:bg-white-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
          
          <div className="flex items-center justify-center flex-1 gap-1 hidden sm:flex">
            {Array.from({ length: totalPages }).map((_, i) => {
              if (i === 0 || i === totalPages - 1 || (i >= page - 1 && i <= page + 1)) {
                return (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                      page === i 
                        ? 'bg-[#127C2F] text-white shadow-sm' 
                        : 'text-paragraph hover:bg-white-bg hover:text-black'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              }
              if (i === page - 2 || i === page + 2) {
                return <span key={i} className="text-paragraph px-1">...</span>;
              }
              return null;
            })}
          </div>

          <button 
            disabled={page === totalPages - 1 || totalPages === 0}
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            className="flex items-center gap-2 px-4 py-2 border border-white-stroke rounded-xl text-sm font-semibold text-black hover:bg-white-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
