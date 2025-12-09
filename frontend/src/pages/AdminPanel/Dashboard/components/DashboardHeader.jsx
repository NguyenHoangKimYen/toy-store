import React from 'react';
import { formatDate } from '@/utils/formatDate';

const DashboardHeader = () => {
  return (
    <div className='mb-4 mt-2 px-4'>
      <span className='block text-lg font-bold text-stone-900'>Welcome back, Admin</span>
      <span className='block text-sm text-stone-500'>{formatDate()}</span>
    </div>
  );
};

export default DashboardHeader;
