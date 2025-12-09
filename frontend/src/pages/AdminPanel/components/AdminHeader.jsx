import React from 'react';
import { Search } from 'lucide-react';

/**
 * Shared admin panel header component with search and action buttons
 * @param {string} title - Header title
 * @param {string} description - Header description
 * @param {string} searchQuery - Current search value
 * @param {function} onSearchChange - Search change handler
 * @param {string} searchPlaceholder - Placeholder text for search input
 * @param {Array} actionButtons - Array of action button objects { icon, label, onClick }
 * @param {React.ReactNode} filters - Optional filter component to show when expanded
 * @param {boolean} showFilters - Whether filters are shown
 */
const AdminHeader = ({
  title,
  description,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  actionButtons = [],
  filters = null,
  showFilters = false,
}) => {
  return (
    <div className='admin-card bg-white/85 backdrop-blur-md border border-purple-100/70 rounded-2xl shadow-[0_18px_42px_-28px_rgba(124,58,237,0.22)] p-4 sm:p-5 md:p-6'>
      <div className='flex flex-col gap-3 sm:gap-4'>
        <div className='flex flex-col gap-3'>
          <div className='space-y-1'>
            <h2 className='text-xl sm:text-2xl font-semibold text-slate-900'>{title}</h2>
            <p className='text-xs sm:text-sm text-slate-500'>{description}</p>
          </div>
          <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
            <label className='flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/85 border border-purple-100/80 shadow-inner backdrop-blur-sm'>
              <Search className='w-4 h-4 text-slate-400 flex-shrink-0' />
              <input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className='w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400'
              />
            </label>
            {actionButtons.length > 0 && (
              <div className='flex gap-2'>
                {actionButtons.map((button, idx) => (
                  <button
                    key={idx}
                    onClick={button.onClick}
                    className='px-3 py-2 rounded-xl border border-purple-100/80 bg-white/80 text-slate-700 hover:bg-purple-50 transition flex items-center gap-2'
                  >
                    {button.icon}
                    <span className='hidden sm:inline'>{button.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {showFilters && filters && (
          <div className='pt-3 border-t border-purple-100/60'>
            {filters}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;
