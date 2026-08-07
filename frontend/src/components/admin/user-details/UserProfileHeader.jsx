import React from 'react';
import { Check } from 'lucide-react';

export default function UserProfileHeader({ user, activeTab, onToggleStatus, onDeleteUser, isUpdating }) {
  const isSuspended = user.suspended;
  
  // As per design, the Delete User button is shown on the Profile Details tab, 
  // while Deactivate/Reactivate is shown on the other tabs.
  const showDelete = activeTab === 'profile';

  return (
    <div className="bg-white border border-white-stroke rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
      <div className="flex items-center gap-5">
        <div className="relative">
          <img 
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.firstName || 'User')}&background=random&size=80`} 
            alt={user.displayName || user.email}
            className="w-[88px] h-[88px] rounded-full object-cover shrink-0 border border-white-stroke"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.firstName || 'User')}&background=random&size=80`;
            }}
          />
          {/* Verified Badge */}
          <div 
            className="absolute bottom-0 right-0 w-6 h-6 bg-[#127C2F] rounded-full flex items-center justify-center border-2 border-white shadow-sm"
            aria-label="Verified User"
          >
            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h2 className="font-heading font-bold text-xl text-[#1F2937]">
              {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'}
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              isSuspended ? 'bg-[#FEE2E2] text-[#EF4444]' : 'bg-[#E9FFEA] text-[#127C2F]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSuspended ? 'bg-[#EF4444]' : 'bg-[#127C2F]'}`}></span>
              {isSuspended ? 'Suspended' : 'Active'}
            </span>
          </div>
          <p className="text-sm text-[#6B7280] flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            {user.email}
          </p>
          <p className="text-sm text-[#6B7280] flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            {user.phone || 'N/A'}
          </p>
          <p className="text-sm text-[#6B7280] flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            {user.address || 'N/A'}
          </p>
        </div>
      </div>
      
      <div className="flex gap-3 w-full sm:w-auto">
        {showDelete ? (
          <button 
            onClick={onDeleteUser}
            disabled={isUpdating}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-white border border-[#EF4444] text-[#EF4444] font-semibold rounded-xl hover:bg-[#FEE2E2] transition-colors shadow-sm disabled:opacity-50"
            aria-label="Delete User"
          >
            Delete User
          </button>
        ) : (
          <button 
            onClick={onToggleStatus}
            disabled={isUpdating || isSuspended}
            className={`flex-1 sm:flex-none px-6 py-2.5 bg-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 ${
              !isSuspended ? 'border border-[#127C2F] text-[#127C2F] hover:bg-[#E9FFEA]' : 'border border-white-stroke text-paragraph'
            }`}
            aria-label="Deactivate User"
          >
            Deactivate User
          </button>
        )}
        
        <button 
          onClick={onToggleStatus}
          disabled={isUpdating || !isSuspended}
          className={`flex-1 sm:flex-none px-6 py-2.5 font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 ${
            isSuspended ? 'bg-[#127C2F] text-white hover:bg-[#127C2F]/90' : 'bg-primary text-white hover:bg-primary/90'
          }`}
          aria-label="Reactivate User"
        >
          Reactivate User
        </button>
      </div>
    </div>
  );
}
