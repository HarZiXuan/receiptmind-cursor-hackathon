import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';

export default function DateFilter({ onDateRangeChange, minDate, maxDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null); // null = custom, or preset name
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCustomRange, setIsCustomRange] = useState(false);
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

  const formatDateForInput = (date) => {
    if (!date) return '';
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return date;
  };

  const handleCustomDateChange = (startDate, endDate) => {
    const start = startDate || customStartDate;
    const end = endDate || customEndDate;
    
    if (start && end) {
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      startDateObj.setHours(0, 0, 0, 0);
      endDateObj.setHours(23, 59, 59, 999);
      
      if (startDateObj <= endDateObj) {
        setIsCustomRange(true);
        setSelectedRange(null);
        onDateRangeChange(startDateObj, endDateObj);
      }
    }
  };

  const handleClearCustomRange = () => {
    setCustomStartDate('');
    setCustomEndDate('');
    setIsCustomRange(false);
    setSelectedRange(null);
    onDateRangeChange(null, null);
  };

  const handlePresetClick = (preset) => {
    setSelectedRange(preset);
    setIsCustomRange(false);
    setCustomStartDate('');
    setCustomEndDate('');
    const range = getDateRange(preset);
    onDateRangeChange(range.start, range.end);
    setIsOpen(false);
  };

  // Don't initialize with default range - let user choose when to filter
  // This ensures all data is shown by default

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentRange = selectedRange 
    ? getDateRange(selectedRange)
    : isCustomRange && customStartDate && customEndDate
      ? { start: new Date(customStartDate), end: new Date(customEndDate) }
      : { start: null, end: null };

  const presets = ['7D', '30D', '3M', '6M', '12M'];

  // Format min/max dates for input constraints
  const minDateStr = minDate ? formatDateForInput(minDate) : '';
  const maxDateStr = maxDate ? formatDateForInput(maxDate) : '';

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
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-[320px]">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-900">Custom Date Range</div>
              {(isCustomRange || customStartDate || customEndDate) && (
                <button
                  onClick={handleClearCustomRange}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear date range"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setCustomStartDate(newStart);
                    if (newStart && customEndDate) {
                      handleCustomDateChange(newStart, customEndDate);
                    }
                  }}
                  min={minDateStr}
                  max={maxDateStr || customEndDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    const newEnd = e.target.value;
                    setCustomEndDate(newEnd);
                    if (customStartDate && newEnd) {
                      handleCustomDateChange(customStartDate, newEnd);
                    }
                  }}
                  min={customStartDate || minDateStr}
                  max={maxDateStr}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                />
              </div>

              {customStartDate && customEndDate && (
                <button
                  onClick={() => {
                    handleCustomDateChange(customStartDate, customEndDate);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                  Apply Range
                </button>
              )}
            </div>
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

