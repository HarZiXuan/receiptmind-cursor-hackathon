import { useState, useRef, useEffect } from 'react';
import { formatAmount } from '../../utils/formatAmount';

const BAR_COLOR = "#0000E6"; 
const HOVER_COLOR = "#3333FF";

export default function BarChart({ data, minDate, maxDate }) {
  const [hoveredData, setHoveredData] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const chartRef = useRef(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
        No data available for graph
      </div>
    );
  }

  // Use all data directly
  const visibleData = data;

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

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      // Example: "Mon Jan"
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short' });
    } catch (e) {
      return dateStr;
    }
  };

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

          {/* Date Labels - under each bar */}
          <div className="absolute bottom-[-30px] left-0 right-0 flex text-[10px] text-gray-400 select-none h-8 pointer-events-none">
            {bars.map((bar, i) => {
              // Only show labels if we have enough space (e.g. fewer than 12 bars) OR if it's every Nth bar
              const showLabel = visibleData.length <= 12 || i % Math.ceil(visibleData.length / 8) === 0;
              
              if (!showLabel) return null;

              return (
                <div 
                  key={i}
                  className="absolute text-center transform -translate-x-1/2 whitespace-nowrap"
                  style={{ 
                    left: `${bar.x + bar.width/2}%`,
                    width: 'auto'
                  }}
                >
                  {formatDateLabel(bar.data.date)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredData && hoverIndex !== null && (
        <div 
          className="absolute bg-white text-gray-900 text-xs rounded-md py-1.5 px-3 shadow-xl border border-gray-200 pointer-events-none z-10"
          style={{ 
            left: `${(hoverIndex * slotWidth) + (slotWidth/2)}%`, // Center of the slot
            top: `${100 - (hoveredData.amount / maxVal) * 100}%`,
            transform: 'translate(-50%, -100%) translateY(-8px)'
          }}
        >
          <div className="font-bold mb-0.5">{formatAmount(hoveredData.amount)}</div>
          <div className="text-gray-500 text-[10px]">{hoveredData.date}</div>
        </div>
      )}
    </div>
  );
}
