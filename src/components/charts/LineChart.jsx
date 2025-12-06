import { useState, useRef, useEffect } from 'react';
import { formatAmount } from '../../utils/formatAmount';

const LINE_COLOR = "#0000E6";

export default function LineChart({ data, minDate, maxDate }) {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
  const [hoveredData, setHoveredData] = useState(null);
  const [hoverX, setHoverX] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const scrollRef = useRef(null);

  // NOW we can do conditional returns after all hooks
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
        No data available for graph
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
        Need at least 2 data points to display graph
      </div>
    );
  }

  // Sort data by date to ensure proper ordering
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.date || 0);
    const dateB = new Date(b.date || 0);
    return dateA - dateB;
  });
  
  // Use all sorted data
  const visibleData = sortedData;
  
  // Ensure we have at least one data point
  if (visibleData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
        No data available for graph
      </div>
    );
  }

  const maxVal = Math.max(...visibleData.map(d => d.amount || 0)) * 1.3 || 100;
  
  const getPath = (points) => {
    if (points.length === 0) return "";
    if (points.length === 1) {
      return `M ${points[0].x},${points[0].y} L ${points[0].x},${points[0].y}`;
    }
    let d = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      
      // For the last segment, ensure control points guarantee reaching exactly 100%
      if (i === points.length - 2) {
        // Make control points very close to the end point to ensure it reaches exactly
        const cp1x = p0.x + (p1.x - p0.x) * 0.6;
        const cp1y = p0.y;
        const cp2x = p1.x - 0.01; // Very close to end point
        const cp2y = p1.y;
        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
        // Add a final line segment to absolutely guarantee reaching 100%
        if (p1.x < 100) {
          d += ` L 100,${p1.y}`;
        }
      } else {
        // Use smooth curves for intermediate segments
        const cp1x = p0.x + (p1.x - p0.x) / 2;
        const cp1y = p0.y;
        const cp2x = p1.x - (p1.x - p0.x) / 2;
        const cp2y = p1.y;
        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
      }
    }
    return d;
  };

  const chartWidth = 100; // Always 100%

  const pointCoords = visibleData.map((d, i) => {
    // Ensure last point reaches exactly 100%
    let xPercent;
    if (visibleData.length === 1) {
      xPercent = 50;
    } else if (i === visibleData.length - 1) {
      // Force last point to exactly 100%
      xPercent = 100;
    } else {
      // Distribute points evenly, but ensure last one is at 100%
      xPercent = (i / (visibleData.length - 1)) * 100;
    }
    const amount = d.amount || 0;
    return {
      x: xPercent,
      y: 100 - (amount / maxVal) * 100,
      data: d
    };
  });

  const pathD = getPath(pointCoords);

  const handleMouseMove = (e) => {
    if (!chartRef.current) return;
    const chartRect = chartRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the chart element
    const x = e.clientX - chartRect.left;
    const chartWidth = chartRef.current.scrollWidth;
    
    const index = Math.round((x / chartWidth) * (visibleData.length - 1));
    const safeIndex = Math.max(0, Math.min(index, visibleData.length - 1));
    const pt = pointCoords[safeIndex];
    
    if (pt) {
      setHoveredData(pt.data);
      // Calculate hover X relative to visible chart area
      const relativeX = (safeIndex / (visibleData.length - 1 || 1)) * 100;
      setHoverX(relativeX);
    }
  };

  const handleMouseLeave = () => {
    setHoveredData(null);
    setHoverX(null);
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <style>{`
        @keyframes drawLine {
          from { stroke-dashoffset: 1000; opacity: 0; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
        .line-animation {
          stroke-dasharray: 1000;
          stroke-dashoffset: 0;
          animation: drawLine 2s ease-out forwards;
        }
      `}</style>
      
      {/* Chart Container - Scroll Logic Removed */}
      <div
        className="flex-1 overflow-hidden pb-6" // Keep padding for labels
      >
        <div 
          ref={chartRef}
          className="relative cursor-crosshair w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            className="w-full h-full overflow-visible"
            style={{ minHeight: '100%' }}
          >
            <path 
              d={pathD} 
              fill="none" 
              stroke={LINE_COLOR} 
              strokeWidth="3" 
              vectorEffect="non-scaling-stroke" 
              strokeLinecap="round"
              strokeLinejoin="round"
              className="line-animation"
            />
            
            {hoverX !== null && (
              <line 
                x1={hoverX} 
                y1="0" 
                x2={hoverX} 
                y2="100" 
                stroke="#374151"
                strokeWidth="1.5" 
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            )}
            
            {hoveredData && hoverX !== null && (
              <line
              x1={hoverX}
              y1={100 - (hoveredData.amount / maxVal) * 100}
              x2={hoverX}
              y2={100 - (hoveredData.amount / maxVal) * 100}
              stroke={LINE_COLOR}
              strokeWidth="10" 
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            )}
          </svg>

          {/* Date Labels - pushed down */}
          <div className="absolute bottom-[-20px] left-0 right-0 flex justify-between text-[10px] text-gray-400 mt-4 select-none px-1">
            <span>{visibleData[0]?.date || minDate || data[0]?.date}</span>
            {visibleData.length > 4 && (
              <>
                <span>{visibleData[Math.floor(visibleData.length * 0.25)]?.date}</span>
                <span>{visibleData[Math.floor(visibleData.length * 0.5)]?.date}</span>
                <span>{visibleData[Math.floor(visibleData.length * 0.75)]?.date}</span>
              </>
            )}
            <span>{visibleData[visibleData.length - 1]?.date || maxDate || data[data.length - 1]?.date}</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredData && hoverX !== null && chartRef.current && (
        <div 
          className="absolute bg-white text-gray-900 text-xs rounded-md py-1.5 px-3 shadow-xl border border-gray-200 pointer-events-none z-10"
          style={{ 
            left: `${hoverX}%`,
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
