import { useState, useRef, useEffect } from 'react';
import { formatAmount } from '../../utils/formatAmount';

const BAR_COLOR = "#0000E6"; 
const HOVER_COLOR = "#3333FF";

export default function BarChart({ data, minDate, maxDate }) {
  const [hoveredData, setHoveredData] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const chartRef = useRef(null);

  // Calculate date range in days
  const getDateRangeDays = () => {
    if (!minDate || !maxDate) return null;
    const start = new Date(minDate);
    const end = new Date(maxDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const dateRangeDays = getDateRangeDays();

  // Create fixed date buckets based on range and aggregate data
  const createFixedBuckets = () => {
    if (!minDate || !maxDate) {
      // Fallback: use data as-is if no date range
      return data.map(d => ({ ...d, bucketDate: d.date }));
    }

    const start = new Date(minDate);
    const end = new Date(maxDate);
    const buckets = [];

    // 7D: Create 7 fixed daily buckets
    if (dateRangeDays && dateRangeDays <= 7) {
      for (let i = 0; i < 7; i++) {
        const bucketDate = new Date(start);
        bucketDate.setDate(start.getDate() + i);
        bucketDate.setHours(0, 0, 0, 0);
        const bucketEnd = new Date(bucketDate);
        bucketEnd.setHours(23, 59, 59, 999);
        if (bucketEnd > end) bucketEnd.setTime(end.getTime());
        
        const dateKey = bucketDate.toISOString().split('T')[0];
        
        // Aggregate all data that falls on this specific day
        let dayAmount = 0;
        data.forEach(d => {
          if (d.date) {
            const dataDate = new Date(d.date);
            dataDate.setHours(0, 0, 0, 0);
            if (dataDate.getTime() === bucketDate.getTime()) {
              dayAmount += d.amount || 0;
            }
          }
        });
        
        buckets.push({
          date: dateKey,
          amount: dayAmount,
          bucketDate: dateKey
        });
      }
    }
    // 1M (30D): Create 4 fixed weekly buckets
    else if (dateRangeDays && dateRangeDays <= 30) {
      const totalDays = dateRangeDays;
      const daysPerWeek = totalDays / 4;
      
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() + Math.floor(i * daysPerWeek));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + Math.ceil(daysPerWeek) - 1);
        weekEnd.setHours(23, 59, 59, 999);
        if (weekEnd > end) weekEnd.setTime(end.getTime());
        
        // Aggregate all data within this week
        let weekAmount = 0;
        const weekStartKey = weekStart.toISOString().split('T')[0];
        const weekEndKey = weekEnd.toISOString().split('T')[0];
        
        // Check all data points to see if they fall within this week
        data.forEach(d => {
          if (d.date) {
            const dataDate = new Date(d.date);
            dataDate.setHours(0, 0, 0, 0);
            if (dataDate >= weekStart && dataDate <= weekEnd) {
              weekAmount += d.amount || 0;
            }
          }
        });
        
        buckets.push({
          date: weekStartKey,
          amount: weekAmount,
          bucketDate: weekStartKey,
          weekEnd: weekEndKey
        });
      }
    }
    // 1Y (12M): Create 12 fixed monthly buckets
    else if (dateRangeDays && dateRangeDays > 30) {
      const startMonth = start.getMonth();
      const startYear = start.getFullYear();
      
      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(startYear, startMonth + i, 1);
        monthDate.setHours(0, 0, 0, 0);
        if (monthDate > end) break;
        
        const monthEnd = new Date(startYear, startMonth + i + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        if (monthEnd > end) monthEnd.setTime(end.getTime());
        
        // Aggregate all data within this month
        let monthAmount = 0;
        const monthStartKey = monthDate.toISOString().split('T')[0];
        const monthEndKey = monthEnd.toISOString().split('T')[0];
        
        // Check all data points to see if they fall within this month
        data.forEach(d => {
          if (d.date) {
            const dataDate = new Date(d.date);
            dataDate.setHours(0, 0, 0, 0);
            if (dataDate >= monthDate && dataDate <= monthEnd) {
              monthAmount += d.amount || 0;
            }
          }
        });
        
        buckets.push({
          date: monthStartKey,
          amount: monthAmount,
          bucketDate: monthDate.toISOString().split('T')[0]
        });
      }
    }
    // Default: use data as-is
    else {
      return data.map(d => ({ ...d, bucketDate: d.date }));
    }

    return buckets;
  };

  const visibleData = createFixedBuckets();

  if (!visibleData || visibleData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
        No data available for graph
      </div>
    );
  }

  const maxVal = Math.max(...visibleData.map(d => d.amount)) * 1.3 || 100;
  const chartWidth = 100; // Always 100%

  // Calculate bar width and spacing
  const slotWidth = 100 / visibleData.length;
  const barWidth = slotWidth * 0.6;
  const gap = slotWidth * 0.2; // Gap on each side

  const bars = visibleData.map((d, i) => {
    const heightPercent = (d.amount / maxVal) * 100;
    const xPercent = i * slotWidth + gap;
    return {
      x: xPercent,
      y: 100 - heightPercent,
      width: barWidth,
      height: heightPercent,
      data: d,
      index: i
    };
  });

  const handleMouseMove = (e) => {
    if (!chartRef.current) return;
    const chartRect = chartRef.current.getBoundingClientRect();
    
    const x = e.clientX - chartRect.left; // X coordinate within the SVG element
    const chartWidthPx = chartRef.current.getBoundingClientRect().width;
    
    const relativeX = x / chartWidthPx; // 0 to 1
    const totalSlots = visibleData.length;
    const index = Math.floor(relativeX * totalSlots);
    
    const safeIndex = Math.max(0, Math.min(index, totalSlots - 1));
    const d = visibleData[safeIndex];
    
    if (d) {
      setHoveredData(d);
      setHoverIndex(safeIndex);
    }
  };

  const handleMouseLeave = () => {
    setHoveredData(null);
    setHoverIndex(null);
  };

  // Format date label based on range - for fixed buckets
  const formatDateLabel = (bucketData, index) => {
    if (!bucketData || !bucketData.bucketDate) return '';
    try {
      const date = new Date(bucketData.bucketDate);
      
      // 7D: Show all 7 dates as "12/7", "12/8" format
      if (dateRangeDays && dateRangeDays <= 7) {
        return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      }
      
      // 30D (1M): Show weekly labels (4 weeks) - show start date of week
      if (dateRangeDays && dateRangeDays <= 30) {
        return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      }
      
      // 12M (1Y): Show monthly labels
      if (dateRangeDays && dateRangeDays > 30) {
        return date.toLocaleDateString('en-US', { month: 'short' });
      }
      
      // Default: show weekday and month
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (e) {
      return bucketData.date || '';
    }
  };

  // Get labels for all fixed buckets (after slotWidth is defined)
  const dateLabels = visibleData.map((d, i) => ({
    date: d.bucketDate || d.date,
    label: formatDateLabel(d, i),
    position: (i * slotWidth) + (slotWidth / 2)
  }));

  return (
    <div className="relative w-full h-full flex flex-col">
      <style>{`
        @keyframes growBar {
          from { transform: scaleY(0); opacity: 0; }
          to { transform: scaleY(1); opacity: 1; }
        }
        .bar-animation {
          transform-origin: bottom;
          animation: growBar 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>

      {/* Chart Container - Scroll Logic Removed */}
      <div
        className="flex-1 overflow-hidden pb-8" // Increased padding for labels
      >
        <div 
          ref={chartRef}
          className="relative w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            className="w-full h-full overflow-visible"
            style={{ minHeight: '100%' }}
          >
            {bars.map((bar, i) => (
              <rect
                key={i}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill={hoverIndex === i ? HOVER_COLOR : BAR_COLOR}
                className="transition-all duration-200 bar-animation"
                style={{ animationDelay: `${i * 50}ms` }}
                rx="1" // slight rounded corners top
              />
            ))}
          </svg>

          {/* Date Labels - evenly spread based on range */}
          <div className="absolute bottom-[-30px] left-0 right-0 text-[10px] text-gray-400 dark:text-gray-500 select-none h-8 pointer-events-none">
            {dateLabels.map((label, i) => (
              <div
                key={i}
                className="absolute text-center transform -translate-x-1/2 whitespace-nowrap"
                style={{
                  left: `${label.position}%`
                }}
              >
                {label.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredData && hoverIndex !== null && (
        <div 
          className="absolute bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs rounded-md py-1.5 px-3 shadow-xl border border-gray-200 dark:border-gray-700 pointer-events-none z-10"
          style={{ 
            left: `${(hoverIndex * slotWidth) + (slotWidth/2)}%`, // Center of the slot
            top: `${100 - (hoveredData.amount / maxVal) * 100}%`,
            transform: 'translate(-50%, -100%) translateY(-8px)'
          }}
        >
          <div className="font-bold mb-0.5">{formatAmount(hoveredData.amount)}</div>
          <div className="text-gray-500 dark:text-gray-400 text-[10px]">
            {hoveredData.bucketDate ? formatDateLabel(hoveredData, hoverIndex) : hoveredData.date}
          </div>
        </div>
      )}
    </div>
  );
}
