import { CheckCircle2, Clock, X, DollarSign } from 'lucide-react';

export default function StatusBadge({ status, isFlagged }) {
  // Normalize status to handle case variations
  const normalizeStatus = (s) => {
    if (!s) return 'Pending Approve';
    const normalized = s.trim();
    // Handle case-insensitive matching
    if (normalized.toLowerCase() === 'approved') return 'Approved';
    if (normalized.toLowerCase() === 'pending approve' || normalized.toLowerCase() === 'pending approval') return 'Pending Approve';
    if (normalized.toLowerCase() === 'flagged' || normalized.toLowerCase() === 'rejected') return 'Rejected';
    if (normalized.toLowerCase() === 'paid') return 'Paid';
    return normalized; // Return as-is if no match
  };

  const normalizedStatus = normalizeStatus(status);

  const styles = {
    'Pending Approve': 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800',
    'Approved': 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800',
    'Rejected': 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800',
    'Paid': 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800'
  };

  const icons = {
    'Pending Approve': <Clock size={12} />,
    'Approved': <CheckCircle2 size={12} />,
    'Rejected': <X size={12} />,
    'Paid': <DollarSign size={12} />
  };

  const displayText = {
    'Pending Approve': 'Pending Approve',
    'Approved': 'Approved',
    'Rejected': 'Rejected',
    'Paid': 'Paid'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[normalizedStatus] || styles['Pending Approve']}`}>
      {icons[normalizedStatus] || icons['Pending Approve']}
      {displayText[normalizedStatus] || normalizedStatus}
    </span>
  );
}

