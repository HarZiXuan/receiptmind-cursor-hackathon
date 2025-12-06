import { X } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import DetailItem from '../ui/DetailItem';
import { formatAmount } from '../../utils/formatAmount';

export default function ReceiptDetailModal({ receipt, onClose, onApprove }) {
  if (!receipt) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Slide-in Panel from Right */}
      <div 
        className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 animate-slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
            <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatAmount(receipt.total_amount)}</p>
              </div>
              <StatusBadge status={receipt.status} isFlagged={receipt.is_flagged} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Merchant" value={receipt.merchant_name} />
              <DetailItem label="Employee" value={receipt.employee_name} />
              <DetailItem label="Date" value={receipt.receipt_date} />
              <DetailItem label="Category" value={receipt.category} />
              <DetailItem label="Employee ID" value={receipt.employee_id} />
              <DetailItem label="Physical Tag" value={receipt.physical_id_tag || 'N/A'} />
            </div>
            {receipt.image_url && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Receipt Image</p>
                <img src={receipt.image_url} className="rounded-xl border border-gray-200 w-full" alt="Receipt" />
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-white">
            <div className="flex gap-3">
              <button 
                onClick={() => onApprove(receipt._id)} 
                className="flex-1 bg-brand text-white py-3 rounded-xl font-medium hover:bg-blue-800 transition-colors"
              >
                Approve & Pay
              </button>
              <button className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

