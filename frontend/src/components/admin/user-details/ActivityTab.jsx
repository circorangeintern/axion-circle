import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, FileText, Calendar, RefreshCcw, Wrench } from 'lucide-react';

export default function ActivityTab({ userId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fallback mock data since the specific user activity endpoint might not exist yet
  const mockActivities = [
    {
      id: '1',
      type: 'SUBMIT_REPORT',
      title: 'Submit Report',
      description: 'You submitted a report for an overflowing bin in Lagos.',
      date: 'Dec 12, 2024',
      time: '12:00 PM',
    },
    {
      id: '2',
      type: 'SCHEDULE_PICKUP',
      title: 'Schedule Pickup',
      description: 'You scheduled a waste pickup for Tuesday, Dec 14.',
      date: 'Dec 12, 2024',
      time: '12:00 PM',
    },
    {
      id: '3',
      type: 'UPDATE_STATUS',
      title: 'Update Status',
      description: 'Your waste pickup was completed by the driver.',
      date: 'Dec 12, 2024',
      time: '12:00 PM',
    },
    {
      id: '4',
      type: 'REQUEST_MAINTENANCE',
      title: 'Request Maintenance',
      description: 'You requested bin maintenance for the damage bin.',
      date: 'Dec 12, 2024',
      time: '12:00 PM',
    },
    {
      id: '5',
      type: 'SUBMIT_REPORT',
      title: 'Submit Report',
      description: 'You submitted a report for illegal dumping in Yaba.',
      date: 'Dec 12, 2024',
      time: '12:00 PM',
    },
  ];

  useEffect(() => {
    const fetchUserActivity = async () => {
      try {
        setLoading(true);
        // Simulating API call
        setTimeout(() => {
          setActivities(mockActivities);
          setTotalPages(3); // Mock pagination
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Failed to fetch user activity', err);
        setLoading(false);
      }
    };
    
    fetchUserActivity();
  }, [userId, page]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'SUBMIT_REPORT':
        return (
          <div className="w-10 h-10 rounded-full bg-[#E9FFEA] border border-[#127C2F] flex items-center justify-center shrink-0 z-10">
            <FileText className="w-5 h-5 text-[#127C2F]" />
          </div>
        );
      case 'SCHEDULE_PICKUP':
        return (
          <div className="w-10 h-10 rounded-full bg-[#E9FFEA] border border-[#127C2F] flex items-center justify-center shrink-0 z-10">
            <Calendar className="w-5 h-5 text-[#127C2F]" />
          </div>
        );
      case 'UPDATE_STATUS':
        return (
          <div className="w-10 h-10 rounded-full bg-[#E0E7FF] border border-[#4338CA] flex items-center justify-center shrink-0 z-10">
            <RefreshCcw className="w-5 h-5 text-[#4338CA]" />
          </div>
        );
      case 'REQUEST_MAINTENANCE':
        return (
          <div className="w-10 h-10 rounded-full bg-[#FEF3C7] border border-[#D97706] flex items-center justify-center shrink-0 z-10">
            <Wrench className="w-5 h-5 text-[#D97706]" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-white-bg border border-white-stroke flex items-center justify-center shrink-0 z-10">
            <div className="w-3 h-3 rounded-full bg-paragraph" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-white-stroke rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 border-b border-white-stroke">
        <h2 className="font-heading font-bold text-lg text-[#1F2937]">Activity History</h2>
      </div>
      
      <div className="p-6 relative min-h-[300px]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex justify-center items-center h-full text-paragraph">
            No activity found for this user.
          </div>
        ) : (
          <div className="relative ml-2 sm:ml-4">
            {/* Vertical Line */}
            <div className="absolute left-[19px] top-4 bottom-8 w-[2px] bg-white-stroke"></div>
            
            <div className="flex flex-col gap-6">
              {activities.map((activity, idx) => (
                <div key={activity.id || idx} className="flex gap-4 sm:gap-6 relative">
                  {getActivityIcon(activity.type)}
                  
                  <div className="flex-1 bg-white border border-white-stroke rounded-2xl p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <h3 className="font-heading font-bold text-base text-[#1F2937]">
                        {activity.title}
                      </h3>
                      <div className="text-sm font-medium text-[#6B7280]">
                        <span>{activity.date}</span>
                        <span className="mx-2">•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                    <p className="text-sm text-[#4B5563]">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Pagination Footer */}
      {!loading && activities.length > 0 && (
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
