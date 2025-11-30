import React from 'react';

const StatCard = ({ title, value, pill, accent }) => (
  <div className='admin-card admin-stat'>
    <div className='flex items-center justify-between mb-2'>
      <span className='text-sm text-stone-600 font-semibold'>{title}</span>
      {pill && (
        <span className='text-[11px] px-2 py-1 rounded-full bg-white/70 text-stone-700 border border-purple-100 shadow-sm'>
          {pill}
        </span>
      )}
    </div>
    <div className='text-3xl font-extrabold text-stone-900 tracking-tight'>{value}</div>
    {accent && <div className='text-xs text-stone-500 mt-2'>{accent}</div>}
  </div>
);

export default StatCard;
