import { useState, useRef, useEffect } from 'react';
import { formatAmount } from '../../utils/formatAmount';

const BAR_COLOR = "#0000E6"; 
const HOVER_COLOR = "#3333FF";

export default function BarChart({ data, minDate, maxDate, preset }) {
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

  // Create fixed date buckets based on preset and aggregate data
  const createFixedBuckets = () => {
    if (!minDate || !maxDate) {
      // Fallback: use data as-is if no date range
      return data.map(d => ({ ...d, bucketDate: d.date }));
    }

    const start = new Date(minDate);
    const end = new Date(maxDate);
    const buckets = [];

    // 7D: Create 7 bars for Monday-Sunday (7 days of the week)
    if (preset === '7D') {
      // Find the Monday of the week containing the end date (most recent week)
      const monday = new Date(end);
      const dayOfWeek = monday.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days
      monday.setDate(monday.getDate() + daysToMonday);
      monday.setHours(0, 0, 0, 0);
      
      // Create 7 daily buckets (Monday to Sunday)
      for (let i = 0; i < 7; i++) {
        const bucketDate = new Date(monday);
        bucketDate.setDate(monday.getDate() + i);
        bucketDate.setHours(0, 0, 0, 0);
        const bucketEnd = new Date(bucketDate);
        bucketEnd.setHours(23, 59, 59, 999);
        
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
    // 30D: Create bars for each day in the date range (30/31 days)
    else if (preset === '30D') {
      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < totalDays; i++) {
        const bucketDate = new Date(start);
        bucketDate.setDate(start.getDate() + i);
        bucketDate.setHours(0, 0, 0, 0);
        if (bucketDate > end) break;
        
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
    // 3M: Create 12 bars for 12 weeks (3 months = ~12 weeks)
    else if (preset === '3M') {
      // Find the Monday of the week containing the start date
      const monday = new Date(start);
      const dayOfWeek = monday.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      monday.setDate(monday.getDate() + daysToMonday);
      monday.setHours(0, 0, 0, 0);
      
      // Create 12 weekly buckets
      for (let i = 0; i < 12; i++) {
        const weekStart = new Date(monday);
        weekStart.setDate(monday.getDate() + (i * 7));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        if (weekEnd > end) weekEnd.setTime(end.getTime());
        if (weekStart > end) break;
        
        // Aggregate all data within this week
        let weekAmount = 0;
        const weekStartKey = weekStart.toISOString().split('T')[0];
        
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
          bucketDate: weekStartKey
        });
      }
    }
    // 6M: Create 24 bars for 24 weeks (6 months = ~24 weeks)
    else if (preset === '6M') {
      // Find the Monday of the week containing the start date
      const monday = new Date(start);
      const dayOfWeek = monday.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      monday.setDate(monday.getDate() + daysToMonday);
      monday.setHours(0, 0, 0, 0);
      
      // Create 24 weekly buckets
      for (let i = 0; i < 24; i++) {
        const weekStart = new Date(monday);
        weekStart.setDate(monday.getDate() + (i * 7));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        if (weekEnd > end) weekEnd.setTime(end.getTime());
        if (weekStart > end) break;
        
        // Aggregate all data within this week
        let weekAmount = 0;
        const weekStartKey = weekStart.toISOString().split('T')[0];
        
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
          bucketDate: weekStartKey
        });
      }
    }
    // 12M (1Y): Create 12 bars for 12 months (January-December)
    else if (preset === '12M') {
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
    // Default: use data as-is if no preset or custom range
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

  // Format date label based on preset - for fixed buckets
  const formatDateLabel = (bucketData, index) => {
    if (!bucketData || !bucketData.bucketDate) return '';
    try {
      const date = new Date(bucketData.bucketDate);
      
      // 7D: Show day name (Monday, Tuesday, etc.)
      if (preset === '7D') {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }
      
      // 30D: Show date as "12/7", "12/8" format
      if (preset === '30D') {
        return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      }
      
      // 3M: Show date format like "12/1"
      if (preset === '3M') {
        return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      }
      
      // 6M: Show date format like "12/1"
      if (preset === '6M') {
        return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      }
      
      // 12M (1Y): Show month name (Jan, Feb, etc.)
      if (preset === '12M') {
        return date.toLocaleDateString('en-US', { month: 'short' });
      }
      
      // Default: show weekday and month
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (e) {
      return bucketData.date || '';
    }
  };

  // Get labels for all fixed buckets (after slotWidth is defined)
  const allDateLabels = visibleData.map((d, i) => ({
    date: d.bucketDate || d.date,
    label: formatDateLabel(d, i),
    position: (i * slotWidth) + (slotWidth / 2)
  }));

  // Filter labels for 30D to show every 3-5 days (not all 30 labels)
  const dateLabels = preset === '30D' && allDateLabels.length > 10
    ? allDateLabels.filter((_, i) => {
        // Show first, last, and every 3rd label in between
        if (i === 0 || i === allDateLabels.length - 1) return true;
        return i % 3 === 0;
      })
    : allDateLabels;

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
