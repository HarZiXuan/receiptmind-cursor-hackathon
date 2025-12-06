import { Menu } from 'lucide-react';
import NavItem from './NavItem';

export default function Sidebar({ isOpen, activeTab, onTabChange, onToggle }) {
  const navItems = [
    { id: 'Dashboard', icon: 'LayoutDashboard', label: 'Home' },
    { id: 'Policy', icon: 'FileText', label: 'Policy' },
    { id: 'Manage Employee', icon: 'Users', label: 'Manage Employee' },
  ];

  return (
    <aside 
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed h-screen transition-all duration-300 ease-in-out z-20 flex flex-col`}
    >
      <div className="p-6 flex items-center justify-between h-20">
        <div className={`flex items-center gap-3 font-bold text-xl tracking-tight text-gray-900 dark:text-white ${!isOpen && 'justify-center w-full'}`}>
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white text-lg shadow-sm flex-shrink-0">
            SC
          </div>
          {isOpen && "Smart Claims"}
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.id}
            isOpen={isOpen}
            onClick={() => onTabChange(item.id)}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <button 
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>
    </aside>
  );
}

