import React from 'react';
import { formatPrice } from '@/utils/formatPrice';

const BarChart = ({ data, colors }) => {
  const max = Math.max(0, ...data.map((d) => d.value));
  return (
    <div className='space-y-2'>
      {data.map((d, idx) => {
        const width = max ? Math.round((d.value / max) * 100) : 0;
        return (
          <div key={d.label} className='text-sm'>
            <div className='flex justify-between text-stone-600 mb-1'>
              <span>{d.label}</span>
              <span className='font-semibold'>{formatPrice(d.value)}</span>
            </div>
            <div className='h-3 bg-stone-100 rounded-full overflow-hidden relative'>
              <div
                className='h-full'
                style={{
                  width: `${width}%`,
                  background: colors[idx] || '#6366f1',
                  transition: 'width 0.3s ease',
                }}
              />
              <span className='absolute inset-0 flex items-center justify-center text-[10px] text-white/90'>
                {width}%
              </span>
            </div>
          </div>
        );
      })}
      {data.length === 0 && <div className='text-xs text-stone-500'>No data</div>}
    </div>
  );
};

export default BarChart;
