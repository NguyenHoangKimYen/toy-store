import React from 'react';

const StatCard = ({ title, value, pill, accent }) => (
  <div className='p-4 rounded-xl bg-white shadow-sm border border-stone-200'>
    <div className='flex items-center justify-between mb-1'>
      <span className='text-sm text-stone-500'>{title}</span>
      {pill && (
        <span className='text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-700'>{pill}</span>
      )}
    </div>
    <div className='text-2xl font-bold text-stone-800'>{value}</div>
    {accent && <div className='text-xs text-stone-500 mt-1'>{accent}</div>}
  </div>
);

export default StatCard;
