import { formatAmount } from '../../utils/formatAmount';

export default function StatRow({ icon: Icon, label, value, amount }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
          <Icon size={16} />
        </div>
        <div className="text-sm font-medium text-gray-700">{label}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{formatAmount(amount)}</div>
      </div>
    </div>
  );
}

