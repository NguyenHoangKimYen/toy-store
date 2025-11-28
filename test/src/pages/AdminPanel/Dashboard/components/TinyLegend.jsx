import React from 'react';

const TinyLegend = ({ items }) => (
  <div className='flex flex-wrap gap-3 text-xs text-stone-600'>
    {items.map((i) => (
      <div key={i.label} className='flex items-center gap-1'>
        <span
          className='inline-block w-3 h-3 rounded-sm'
          style={{ background: i.color }}
        />
        <span>{i.label}</span>
      </div>
    ))}
  </div>
);

export default TinyLegend;
