import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { formatAmount } from '../../utils/formatAmount';

const LINE_COLOR = "#1A4D2E";
const MIN_ZOOM = 1; // Show all data
const MAX_ZOOM = 10; // Show very focused view
const ZOOM_STEP = 0.5;

export default function LineChart({ data, minDate, maxDate }) {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
  const [hoveredData, setHoveredData] = useState(null);
  const [hoverX, setHoverX] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = show all, higher = zoomed in
  const [scrollPosition, setScrollPosition] = useState(0);
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const scrollRef = useRef(null);

  // Update scroll position when zoom changes
  useEffect(() => {
    if (scrollRef.current && zoomLevel > MIN_ZOOM) {
      const container = scrollRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const newScroll = scrollPosition * maxScroll;
      container.scrollLeft = newScroll;
    }
  }, [zoomLevel, scrollPosition]);

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

  // Calculate visible data range based on zoom
  const totalDataPoints = data.length;
  const visibleDataPoints = Math.max(1, Math.ceil(totalDataPoints / zoomLevel));
  const maxScrollRange = Math.max(0, totalDataPoints - visibleDataPoints);
  const startIndex = Math.max(0, Math.floor(scrollPosition * maxScrollRange));
  const endIndex = Math.min(startIndex + visibleDataPoints, totalDataPoints);
  const visibleData = data.slice(startIndex, endIndex);
  
  // Ensure we have at least one data point
  if (visibleData.length === 0 && data.length > 0) {
    visibleData.push(data[0]);
  }

  const maxVal = Math.max(...visibleData.map(d => d.amount)) * 1.1 || 100;
  
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

  // Calculate width multiplier based on zoom (zoomed in = wider chart)
  const chartWidth = zoomLevel * 100; // Base 100%, multiply by zoom level

  const pointCoords = visibleData.map((d, i) => ({
    x: (i / (visibleData.length - 1 || 1)) * 100,
    y: 100 - (d.amount / maxVal) * 100,
    data: d
  }));

  const pathD = getPath(pointCoords);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM);
    setZoomLevel(newZoom);
    // Reset scroll position if zoomed out to show all
    if (newZoom === MIN_ZOOM) {
      setScrollPosition(0);
    }
  };

  const handleScroll = (e) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const normalizedScroll = maxScroll > 0 ? scrollLeft / maxScroll : 0;
    setScrollPosition(normalizedScroll);
  };

  const handleMouseMove = (e) => {
    if (!chartRef.current || !scrollRef.current) return;
    const containerRect = scrollRef.current.getBoundingClientRect();
    const chartRect = chartRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the scrolled chart
    const x = e.clientX - chartRect.left + scrollRef.current.scrollLeft;
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
      {/* Zoom Controls */}
      <div className="flex items-center gap-2 mb-2 justify-end">
        <button
          onClick={handleZoomOut}
          disabled={zoomLevel <= MIN_ZOOM}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs text-gray-500 min-w-[60px] text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          disabled={zoomLevel >= MAX_ZOOM}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
      </div>

      {/* Scrollable Chart Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden chart-scrollbar"
        onScroll={handleScroll}
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#D1D5DB #F3F4F6'
        }}
      >
        <div 
          ref={chartRef}
          className="relative cursor-crosshair"
          style={{ 
            width: `${chartWidth}%`,
            minWidth: '100%',
            height: '100%'
          }}
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

          {/* Date Labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-gray-400 mt-2 select-none px-1">
            <span>{visibleData[0]?.date || minDate || data[0]?.date}</span>
            <span>{visibleData[visibleData.length - 1]?.date || maxDate || data[data.length - 1]?.date}</span>
          </div>
        </div>
      </div>

      {/* Tooltip - positioned inside scrollable container */}
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
