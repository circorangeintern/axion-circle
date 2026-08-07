import React from 'react';

export default function UserTabsBar({ activeTab, onChange, reportsCount }) {
  const tabs = [
    { id: 'profile', label: 'Profile Details' },
    { id: 'reports', label: `Reports (${reportsCount})` },
    { id: 'rewards', label: 'Rewards' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="bg-white border border-white-stroke rounded-xl shadow-sm p-1 inline-flex w-full sm:w-auto overflow-x-auto" role="tablist">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              isActive 
                ? 'bg-white text-black shadow-sm' 
                : 'text-[#6B7280] hover:text-[#1F2937] hover:bg-white-bg/50'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
