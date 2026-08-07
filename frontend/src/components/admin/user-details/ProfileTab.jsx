import React from 'react';

export default function ProfileTab({ user }) {
  const fields = [
    { label: 'First Name', value: user.firstName || '' },
    { label: 'Middle Name', value: '' }, // Not in our backend model currently, leave blank or handle if added
    { label: 'Last Name', value: user.lastName || '' },
    { label: 'Phone Number', value: user.phone || '' },
    { label: 'Gender', value: user.gender || '', isSelect: true },
    { label: 'Email Address', value: user.email || '' },
    { label: 'Home Address', value: user.address || '', isTextarea: true },
  ];

  return (
    <div className="flex flex-col gap-6 py-4">
      {fields.map((field, idx) => (
        <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label className="sm:w-[200px] text-sm font-bold text-[#1F2937] pt-3 shrink-0">
            {field.label}
          </label>
          <div className="flex-1 w-full max-w-[600px]">
            {field.isTextarea ? (
              <div className="relative">
                <textarea 
                  readOnly
                  value={field.value}
                  className="w-full p-4 rounded-xl border border-white-stroke bg-white text-sm text-[#1F2937] resize-none h-[120px] focus:outline-none"
                />
                <div className="text-xs text-[#9CA3AF] mt-2">400 characters left</div>
              </div>
            ) : field.isSelect ? (
              <div className="relative">
                <select 
                  disabled
                  value={field.value.toLowerCase()}
                  className="w-full p-4 pr-10 rounded-xl border border-white-stroke bg-white text-sm text-[#1F2937] appearance-none focus:outline-none opacity-100"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            ) : (
              <div className="relative">
                {field.label === 'Email Address' && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                )}
                {field.label === 'Phone Number' && field.value && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                    {/* Placeholder flag icon, typically you'd use a library or actual SVG flag */}
                    <span className="text-base mr-1">🇺🇸</span> 
                  </div>
                )}
                <input 
                  type="text" 
                  readOnly
                  value={field.value}
                  className={`w-full p-4 rounded-xl border border-white-stroke bg-white text-sm text-[#1F2937] focus:outline-none ${field.label === 'Email Address' ? 'pl-11' : ''} ${field.label === 'Phone Number' && field.value ? 'pl-11' : ''}`}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
