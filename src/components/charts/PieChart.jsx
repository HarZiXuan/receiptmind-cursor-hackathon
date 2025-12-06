import { useMemo } from 'react';
import { formatAmount } from '../../utils/formatAmount';

export default function PieChart({ data, totalAmount, onStatusSelect, selectedStatus }) {
  // data should be an array of { label, value, color, count, amount }
  // totalAmount is the sum of all amounts

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let cumulativePercent = 0;
    return data.map((item) => {
      const percent = item.amount / totalAmount;
      const startPercent = cumulativePercent;
      cumulativePercent += percent;
      return {
        ...item,
        percent,
        startPercent,
        endPercent: cumulativePercent
      };
    });
  }, [data, totalAmount]);

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const getPath = (startPercent, endPercent) => {
    // Adjust to start from top (subtract 0.25)
    const start = startPercent - 0.25;
    const end = endPercent - 0.25;

    const [startX, startY] = getCoordinatesForPercent(start);
    const [endX, endY] = getCoordinatesForPercent(end);

    const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;

    // Path for a donut slice
    // Move to start outer
    // Arc to end outer
    // Line to end inner
    // Arc to start inner
    // Close path
    
    // We'll use stroke-dasharray on a circle for simplicity in SVG, 
    // but for precise segments with gaps (like the image), separate paths are better.
    // Let's stick to simple circle segments using stroke-dasharray for the donut look.
    // Actually, creating paths allows for interactivity (hover/click).
    
    return [
      `M ${startX} ${startY}`, // Move to start
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc to end
      `L 0 0`, // Line to center (we will mask the center to make it a donut)
    ].join(' ');
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data available
      </div>
    );
  }

  // Sort data so larger segments are rendered nicely if needed, 
  // but preserving order is usually better for legend matching.
  
  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 min-h-[200px] flex items-center justify-center">
        <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full max-w-[240px] transform -rotate-90">
          {chartData.map((slice, i) => {
            // Calculate dash array for circle method
            // Circumference = 2 * PI * r. Let r=1. C ≈ 6.283
            // Dash = [length, gap]
            // length = percent * C
            // gap = C - length
            // offset = - (startPercent * C)
            
            const r = 1;
            const C = 2 * Math.PI * r;
            const length = (slice.percent * C) - 0.05; // Subtract a bit for gap
            const safeLength = Math.max(0, length);
            const offset = -(slice.startPercent * C); // Negative because dashoffset moves start point counter-clockwise? No, standard is clockwise from 3 o'clock.
            // Rotated svg -90deg makes 3 o'clock become 12 o'clock.
            
            // Wait, using stroke-dasharray on a circle is easier for the "gap" look.
            
            return (
              <circle
                key={slice.label}
                r="1"
                cx="0"
                cy="0"
                fill="transparent"
                stroke={slice.color}
                strokeWidth="0.4" // Thickness of the donut
                strokeDasharray={`${safeLength} ${C - safeLength}`}
                strokeDashoffset={- (slice.startPercent * C)}
                className="transition-all duration-300 cursor-pointer hover:opacity-80"
                onClick={() => onStatusSelect(slice.label)}
                style={{
                  opacity: selectedStatus === 'ALL' || selectedStatus === slice.label ? 1 : 0.3
                }}
              />
            );
          })}
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xs text-gray-500 font-medium">Total Spending</p>
          <p className="text-xl font-bold text-gray-900">{formatAmount(totalAmount)}</p>
        </div>
      </div>

      {/* Legend - positioned around/below like the image */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {data.map((item) => (
          <button
            key={item.label}
            onClick={() => onStatusSelect(item.label)}
            className={`flex items-start gap-2 p-2 rounded-lg transition-all text-left ${
              selectedStatus === item.label ? 'bg-gray-50 ring-1 ring-gray-200' : 'hover:bg-gray-50'
            }`}
          >
            <span className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: item.color }}></span>
            <div>
              <div className="text-xs font-medium text-gray-900">{item.label}</div>
              <div className="text-xs text-gray-500">
                {formatAmount(item.amount)} ({Math.round((item.amount / totalAmount) * 100) || 0}%)
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

