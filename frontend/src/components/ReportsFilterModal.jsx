import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

export default function ReportsFilterModal({ isOpen, onClose, onApply }) {
  if (!isOpen) return null;

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedUrgencies, setSelectedUrgencies] = useState([]);

  const categories = [
    'Illegal Dumping',
    'Overflowing Bin',
    'Blocked Drainage',
    'Street Litter',
    'Residential Dump',
    'Commercial Dump',
    'Garden Waste',
  ];

  const urgencies = ['Routine', 'Very Urgent', 'Critical'];

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleUrgency = (urg) => {
    setSelectedUrgencies((prev) =>
      prev.includes(urg) ? prev.filter((u) => u !== urg) : [...prev, urg]
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[380px] bg-white rounded-2xl shadow-xl z-50 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-black font-heading">Filters</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-black-icon hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-paragraph font-medium">find the reports you want to see easily</p>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto pt-2 flex-1">
          {/* Saved Filter Dropdown */}
          <div className="relative mb-6">
            <button className="w-full px-4 py-3 border border-white-stroke rounded-xl flex items-center justify-between bg-white focus:outline-none">
              <div className="flex items-center gap-2 text-paragraph">
                <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 1H1L6.6 7.3V11.5L9.4 13V7.3L15 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm">Select saved filter</span>
              </div>
              <ChevronDown className="w-4 h-4 text-black-icon" />
            </button>
          </div>

          {/* Category Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-black mb-3">Category</h3>
            <div className="space-y-3">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer appearance-none w-4 h-4 border border-white-stroke rounded-[4px] checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    <svg
                      className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#001310]">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Urgency Level Section */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">Urgency Level</h3>
            <div className="space-y-3">
              {urgencies.map((urg) => (
                <label key={urg} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer appearance-none w-4 h-4 border border-white-stroke rounded-[4px] checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                      checked={selectedUrgencies.includes(urg)}
                      onChange={() => toggleUrgency(urg)}
                    />
                    <svg
                      className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#001310]">{urg}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white-stroke flex items-center justify-end gap-3 bg-white rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-white-stroke text-sm font-semibold text-black hover:bg-white-bg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onApply({ categories: selectedCategories, urgencies: selectedUrgencies });
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
