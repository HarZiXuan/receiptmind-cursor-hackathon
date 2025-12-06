import { useState, useEffect } from 'react';
import { X, CreditCard, RotateCcw, FileText, Archive, Send, CheckCircle2, Loader2 } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import DetailItem from '../ui/DetailItem';
import { formatAmount } from '../../utils/formatAmount';

export default function ReceiptDetailModal({ 
  receipt, 
  onClose,
  onApprove,
  onPay,
  onDirectPay,
  onUndoApproval,
  onReopenClaim,
  onSendRejectionNote,
  onArchive
}) {
  const [countdown, setCountdown] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStartedCountdown, setHasStartedCountdown] = useState(false);

  // Reset countdown when receipt changes or status changes away from Approved
  useEffect(() => {
    if (receipt?.status !== 'Approved') {
      setCountdown(null);
      setIsProcessing(false);
      setHasStartedCountdown(false);
    }
  }, [receipt?._id, receipt?.status]);

  // Start countdown when status becomes Approved
  useEffect(() => {
    if (receipt?.status === 'Approved' && !hasStartedCountdown && countdown === null) {
      setIsProcessing(true);
      setHasStartedCountdown(true);
      setCountdown(30);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            // Auto-pay after countdown
            if (onDirectPay && receipt._id) {
              onDirectPay(receipt._id);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [receipt?.status, receipt?._id, onDirectPay, hasStartedCountdown, countdown]);

  if (!receipt) return null;

  const status = receipt.status || '';

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
            {status === 'Approved' && (
              <div className="flex flex-col gap-3">
                {countdown !== null && countdown > 0 ? (
                  <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Loader2 size={18} className="text-amber-700 animate-spin" />
                      <p className="text-sm font-medium text-amber-900">Pending money sending...</p>
                    </div>
                    <p className="text-2xl font-bold text-amber-700">{countdown}s</p>
                    <p className="text-xs text-amber-600 mt-1">Payment will be processed automatically</p>
                  </div>
                ) : countdown === 0 ? (
                  <div className="w-full bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-sm font-medium text-green-700">Processing payment...</p>
                  </div>
                ) : null}
                <button 
                  onClick={() => onUndoApproval(receipt._id)}
                  disabled={countdown !== null && countdown > 0}
                  className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw size={18} />
                  Undo Approval
                </button>
              </div>
            )}

            {status === 'Flagged' && (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => onReopenClaim(receipt._id)}
                  className="w-full bg-brand text-white py-3 rounded-xl font-medium hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText size={18} />
                  Reopen Claim
                </button>
                <button 
                  onClick={() => onSendRejectionNote(receipt._id)}
                  className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Send Rejection Note
                </button>
                <button 
                  onClick={() => onArchive(receipt._id)}
                  className="w-full border border-red-200 text-red-700 py-3 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Archive size={18} />
                  Archive
                </button>
              </div>
            )}

            {status === 'Paid' && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No actions available for paid receipts
              </div>
            )}

            {status === 'Pending Approve' && (
              <div className="flex gap-3">
                <button 
                  onClick={() => onPay(receipt._id)} 
                  className="flex-1 bg-brand text-white py-3 rounded-xl font-medium hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard size={18} />
                  Pay via Ryt Bank
                </button>
                <button className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

