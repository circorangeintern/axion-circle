import React from 'react';

export default function UserStatCards({ user }) {
  // Using 0 as fallback, and mocking resolvedReports and creditsRedeemed since they are missing from backend API currently
  const stats = [
    { label: 'Reports submitted', value: user.totalReports || 0 },
    { label: 'Resolved reports', value: user.resolvedReports ?? 0 }, // Backend doesn't provide this yet
    { label: 'Credit balance', value: user.creditBalance || 0 },
    { label: 'Credits redeemed', value: user.creditsRedeemed ?? 0 }, // Backend doesn't provide this yet
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white border border-white-stroke rounded-2xl shadow-sm p-5 flex flex-col gap-2">
          <h3 className="text-sm font-medium text-[#6B7280]">{stat.label}</h3>
          <p className="font-heading font-bold text-3xl text-[#1F2937]">
            {stat.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
