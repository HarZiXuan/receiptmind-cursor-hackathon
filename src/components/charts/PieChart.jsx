import { useMemo, useEffect, useState } from 'react';
import { formatAmount } from '../../utils/formatAmount';

export default function PieChart({ data, totalAmount, onStatusSelect, selectedStatus }) {
  // data should be an array of { label, value, color, count, amount }
  // totalAmount is the sum of all amounts
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation slightly after mount
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

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

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data available
      </div>
    );
  }
  
  // Find the selected item's amount if one is selected
  const selectedItem = selectedStatus !== 'ALL' ? data.find(d => d.label === selectedStatus) : null;
  const displayAmount = selectedItem ? selectedItem.amount : null;

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 min-h-[200px] flex items-center justify-center">
        <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full max-w-[240px] transform -rotate-90">
          {chartData.map((slice, i) => {
            const r = 1;
            const C = 2 * Math.PI * r;
            const length = (slice.percent * C) - 0.05; // Subtract a bit for gap
            const safeLength = Math.max(0, length);
            
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
                strokeDashoffset={isLoaded ? - (slice.startPercent * C) : C} // Start completely dashed/hidden if not loaded
                className="transition-all duration-1000 ease-out cursor-pointer hover:opacity-80"
                onClick={() => onStatusSelect(slice.label)}
                style={{
                  opacity: selectedStatus === 'ALL' || selectedStatus === slice.label ? 1 : 0.3,
                  transitionProperty: 'stroke-dashoffset, opacity'
                }}
              />
            );
          })}
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {selectedStatus === 'ALL' ? (
             <>
               <p className="text-xs text-gray-500 font-medium">All Status</p>
               {/* Removed combined total as requested */}
             </>
          ) : (
             <>
               <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{selectedStatus}</p>
               <p className="text-xl font-bold text-gray-900 dark:text-white">{formatAmount(displayAmount || 0)}</p>
             </>
          )}
        </div>
      </div>

      {/* Legend - positioned around/below like the image */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {data.map((item) => (
          <button
            key={item.label}
            onClick={() => onStatusSelect(item.label)}
            className={`flex items-start gap-2 p-2 rounded-lg transition-all text-left ${
              selectedStatus === item.label 
                ? 'bg-gray-50 dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-600' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: item.color }}></span>
            <div>
              <div className="text-xs font-medium text-gray-900 dark:text-white">{item.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatAmount(item.amount)} ({Math.round((item.amount / totalAmount) * 100) || 0}%)
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
