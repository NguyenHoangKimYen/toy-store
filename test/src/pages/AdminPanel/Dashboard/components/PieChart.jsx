import React from 'react';

const PieChart = ({ data, colors, size = 160 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  const radius = size / 2;

  if (total === 0) {
    return (
      <div className='flex items-center justify-center text-xs text-stone-500 h-full'>
        No data
      </div>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d, i) => {
        const start = (acc / total) * 2 * Math.PI;
        const end = ((acc + d.value) / total) * 2 * Math.PI;
        acc += d.value;
        const largeArc = end - start > Math.PI ? 1 : 0;
        const x1 = radius + radius * Math.cos(start);
        const y1 = radius + radius * Math.sin(start);
        const x2 = radius + radius * Math.cos(end);
        const y2 = radius + radius * Math.sin(end);
        const mid = (start + end) / 2;
        const labelX = radius + (radius * 0.55) * Math.cos(mid);
        const labelY = radius + (radius * 0.55) * Math.sin(mid);
        const pct = total ? Math.round((d.value / total) * 100) : 0;

        return (
          <g key={d.label}>
            <path
              d={`M${radius},${radius} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`}
              fill={colors[i] || '#cbd5e1'}
              stroke='#fff'
              strokeWidth='1'
            />
            {pct > 0 && (
              <text
                x={labelX}
                y={labelY}
                textAnchor='middle'
                dominantBaseline='middle'
                fill='#0f172a'
                fontSize='10'
              >
                {pct}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default PieChart;
