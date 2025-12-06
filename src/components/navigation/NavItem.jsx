import { 
  LayoutDashboard, 
  FileText, 
  Activity,
  Users
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  FileText,
  Activity,
  Users,
};

export default function NavItem({ icon, label, isActive, isOpen, onClick }) {
  const Icon = iconMap[icon] || LayoutDashboard;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        isActive 
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      <Icon size={20} className={isActive ? 'text-brand dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'} />
      {isOpen && <span className="text-sm">{label}</span>}
    </button>
  );
}

