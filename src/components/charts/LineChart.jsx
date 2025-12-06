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

  // Use all data without zooming logic
  const visibleData = data;
  
  // Ensure we have at least one data point
  if (visibleData.length === 0 && data.length > 0) {
    visibleData.push(data[0]);
  }

  const maxVal = Math.max(...visibleData.map(d => d.amount)) * 1.3 || 100;
  
  const getPath = (points) => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p1.x - (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const chartWidth = 100; // Always 100%

  const pointCoords = visibleData.map((d, i) => ({
    x: (i / (visibleData.length - 1 || 1)) * 100,
    y: 100 - (d.amount / maxVal) * 100,
    data: d
  }));

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
