import { CheckCircle2, Clock, AlertCircle, DollarSign } from 'lucide-react';

export default function StatusBadge({ status, isFlagged }) {
  const styles = {
    'Pending Approve': 'bg-amber-50 text-amber-700 border-amber-100',
    'Approved': 'bg-green-50 text-green-700 border-green-100',
    'Flagged': 'bg-red-50 text-red-700 border-red-100',
    'Paid': 'bg-purple-50 text-purple-700 border-purple-100'
  };

  const icons = {
    'Pending Approve': <Clock size={12} />,
    'Approved': <CheckCircle2 size={12} />,
    'Flagged': <AlertCircle size={12} />,
    'Paid': <DollarSign size={12} />
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles['Pending Approve']}`}>
      {icons[status]}
      {status}
    </span>
  );
}

