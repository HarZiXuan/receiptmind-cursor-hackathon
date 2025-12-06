export default function ActionButton({ icon: Icon, label, primary, onClick }) {
  return (
    <button 
      onClick={onClick}
      type="button"
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        primary 
          ? 'bg-brand text-white hover:bg-blue-800' 
          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

