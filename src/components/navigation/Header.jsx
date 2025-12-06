import { Search, Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 px-8 flex items-center justify-between sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm">
      <div className="flex-1"></div>
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-600">
          <Search size={20} />
        </button>
        <button className="relative text-gray-400 hover:text-gray-600">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-50"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-medium">
          JD
        </div>
      </div>
    </header>
  );
}

