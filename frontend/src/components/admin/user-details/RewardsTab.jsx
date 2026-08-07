import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowDown } from 'lucide-react';

export default function RewardsTab({ userId }) {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fallback mock data since the specific user rewards admin endpoint might not exist yet
  const mockRewards = [
    { id: '1', rewardName: 'Free Trash bags', store: 'Shoprite', creditsCost: 200, createdAt: '2026-02-23T10:00:00Z', status: 'PENDING' },
    { id: '2', rewardName: '$5 off cleaning supplies', store: 'Spar', creditsCost: 500, createdAt: '2026-02-24T10:00:00Z', status: 'APPROVED' },
    { id: '3', rewardName: '10% Discount Coupon', store: 'Justrite', creditsCost: 300, createdAt: '2026-02-25T10:00:00Z', status: 'APPROVED' },
    { id: '4', rewardName: 'Free Recycling Bin', store: 'WasteCo', creditsCost: 1000, createdAt: '2026-02-26T10:00:00Z', status: 'REJECTED' },
  ];

  useEffect(() => {
    const fetchUserRewards = async () => {
      try {
        setLoading(true);
        // Simulating API call
        setTimeout(() => {
          setRewards(mockRewards);
          setTotalPages(5); // Mock pagination
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Failed to fetch user rewards', err);
        setLoading(false);
      }
    };
    
    fetchUserRewards();
  }, [userId, page]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-[#F59E0B]';
      case 'APPROVED': return 'text-[#10B981]';
      case 'REJECTED': return 'text-[#EF4444]';
      default: return 'text-[#6B7280]';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      default: return status;
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-[#F59E0B]'; 
      case 'APPROVED': return 'bg-[#10B981]'; 
      case 'REJECTED': return 'bg-[#EF4444]';
      default: return 'bg-[#6B7280]';
    }
  };

  return (
    <div className="bg-white border border-white-stroke rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 border-b border-white-stroke">
        <h2 className="font-heading font-bold text-lg text-[#1F2937]">Rewards Earned</h2>
      </div>
      
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-white-stroke text-xs font-semibold text-paragraph h-[44px]">
              <th className="px-5 py-3 whitespace-nowrap">Rewards</th>
              <th className="px-5 py-3 whitespace-nowrap">Store</th>
              <th className="px-5 py-3 cursor-pointer whitespace-nowrap">
                <div className="flex items-center gap-1">Credits <ArrowDown className="w-3 h-3 text-paragraph" /></div>
              </th>
              <th className="px-5 py-3 whitespace-nowrap">Date</th>
              <th className="px-5 py-3 cursor-pointer whitespace-nowrap">
                <div className="flex items-center gap-1">Status <ArrowDown className="w-3 h-3 text-paragraph" /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white-stroke text-sm">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-5 py-12 text-center">
                  <div className="flex justify-center items-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </td>
              </tr>
            ) : rewards.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-5 py-12 text-center text-paragraph">
                  No rewards claimed by this user.
                </td>
              </tr>
            ) : (
              rewards.map((reward) => {
                const isRejected = reward.status === 'REJECTED';
                
                return (
                  <tr key={reward.id} className="hover:bg-white-bg/50 transition-colors bg-white h-[72px]">
                    <td className={`px-5 py-4 font-bold text-[#1F2937] text-sm whitespace-nowrap ${isRejected ? 'line-through text-[#6B7280]' : ''}`}>
                      {reward.rewardName}
                    </td>
                    <td className={`px-5 py-4 text-[#4B5563] text-sm whitespace-nowrap ${isRejected ? 'line-through text-[#6B7280]' : ''}`}>
                      {reward.store}
                    </td>
                    <td className={`px-5 py-4 font-bold text-[#1F2937] text-sm whitespace-nowrap ${isRejected ? 'line-through text-[#6B7280]' : ''}`}>
                      {reward.creditsCost}
                    </td>
                    <td className="px-5 py-4 text-[#4B5563] text-sm whitespace-nowrap">
                      {new Date(reward.createdAt).toISOString().split('T')[0]}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDotColor(reward.status)}`}></span>
                        <span className={`text-xs font-bold ${getStatusColor(reward.status)}`}>
                          {getStatusText(reward.status)}
                        </span>
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
      {!loading && rewards.length > 0 && (
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
