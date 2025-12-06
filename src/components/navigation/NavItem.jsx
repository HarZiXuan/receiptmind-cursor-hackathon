import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Activity 
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  FileText,
  Settings,
  Activity,
};

export default function NavItem({ icon, label, isActive, isOpen, onClick }) {
  const Icon = iconMap[icon] || LayoutDashboard;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        isActive 
          ? 'bg-gray-100 text-gray-900 font-medium' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon size={20} className={isActive ? 'text-brand' : 'text-gray-400'} />
      {isOpen && <span className="text-sm">{label}</span>}
    </button>
  );
}

