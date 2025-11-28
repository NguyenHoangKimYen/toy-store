import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/common';

/**
 * Reusable Admin Content Wrapper with sticky header behavior
 * Used by Users, Products, Orders pages
 */
const AdminContent = ({
  header,
  stats,
  filters,
  children,
  loading,
  error,
  onRetry,
}) => {
  const [stickyScrolled, setStickyScrolled] = useState(false);

  useEffect(() => {
    const scrollContainer = document.querySelector('.admin-scroll-container');
    if (!scrollContainer) return;

    const handleScroll = () => {
      setStickyScrolled(scrollContainer.scrollTop > 20);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className='h-full flex flex-col'>
      <div className='flex-1 overflow-y-auto px-4 sm:px-6 admin-scroll-container'>
        <div className='py-4 sm:py-6'>
          {header}

          <div
            className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${
              stickyScrolled ? 'shadow-md' : ''
            }`}
          >
            {filters}
          </div>

          {stats && <div className='mb-6'>{stats}</div>}

          {error ? (
            <div className='text-center py-12'>
              <h3 className='text-lg font-semibold text-red-600 mb-2'>Error Loading Data</h3>
              <p className='text-gray-600 mb-4'>{error}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                >
                  Retry
                </button>
              )}
            </div>
          ) : loading ? (
            <div className='text-center py-12'>
              <LoadingSpinner size='lg' />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContent;
