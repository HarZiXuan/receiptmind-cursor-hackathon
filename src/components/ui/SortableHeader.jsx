import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

export default function SortableHeader({ label, sortKey, currentSort, onSort }) {
  const isSorted = currentSort.key === sortKey;
  
  return (
    <th 
      className="px-6 py-4 font-medium cursor-pointer hover:text-gray-700 transition-colors select-none"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isSorted ? (
          currentSort.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
        ) : (
          <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-50" />
        )}
      </div>
    </th>
  );
}

