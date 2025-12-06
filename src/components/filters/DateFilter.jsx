import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

export default function DateFilter({ onDateRangeChange, minDate, maxDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('30D');
  const dropdownRef = useRef(null);

  // Calculate date ranges
  const getDateRange = (preset) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(23, 59, 59, 999);
    
    let startDate = new Date(today);
    
    switch (preset) {
      case '7D':
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '30D':
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '3M':
        startDate.setMonth(startDate.getMonth() - 3);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '6M':
        startDate.setMonth(startDate.getMonth() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '12M':
        startDate.setMonth(startDate.getMonth() - 12);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        return { start: null, end: null };
    }
    
    return { start: startDate, end: today };
  };

  const formatDateRange = (start, end) => {
    if (!start || !end) return 'Select date range';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const startStr = start.toLocaleDateString('en-US', options);
    const endStr = end.toLocaleDateString('en-US', options);
    return `${startStr} - ${endStr}`;
  };

  const handlePresetClick = (preset) => {
    setSelectedRange(preset);
    const range = getDateRange(preset);
    onDateRangeChange(range.start, range.end);
    setIsOpen(false);
  };

  // Initialize with default range on mount
  useEffect(() => {
    const range = getDateRange(selectedRange);
    if (range.start && range.end) {
      onDateRangeChange(range.start, range.end);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentRange = getDateRange(selectedRange);

  const presets = ['7D', '30D', '3M', '6M', '12M'];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Date Range Button */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Calendar size={16} className="text-gray-500" />
          <span>{formatDateRange(currentRange.start, currentRange.end)}</span>
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2 min-w-[200px]">
            <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">Custom Range</div>
            <div className="text-xs text-gray-400 px-2 py-1 mb-2 border-b border-gray-100">
              Coming soon
            </div>
            <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">Quick Presets</div>
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetClick(preset)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  selectedRange === preset
                    ? 'bg-brand/10 text-brand font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Preset Buttons */}
      <div className="flex items-center gap-1">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePresetClick(preset)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedRange === preset
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}

