import React from 'react';
import { formatDate } from '@/utils/formatDate';

const DashboardHeader = () => {
  return (
    <div className='border-b px-4 mb-4 mt-2 pb-4 border-stone-200'>
      <div className='flex items-center justify-between p-0.5'>
        <div>
          <span className='block font-bold'>Wassup, admin!</span>
          <span className='block text-sm text-stone-500'>{formatDate()}</span>
        </div>
        <div>
          <button className='flex text-sm items-center gap-2 bg-stone-100 transition-colors hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded cursor-pointer'>
            Mock
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
