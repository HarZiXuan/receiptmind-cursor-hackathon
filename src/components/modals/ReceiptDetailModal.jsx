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
  onReject,
  onSendRejectionNote,
  onArchive
}) {
  const [countdown, setCountdown] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStartedCountdown, setHasStartedCountdown] = useState(false);
  const [paymentCountdown, setPaymentCountdown] = useState(null);
  const [hasStartedPaymentCountdown, setHasStartedPaymentCountdown] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectSuccess, setShowRejectSuccess] = useState(false);
  const [showRejectionNoteModal, setShowRejectionNoteModal] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [showRejectionNoteSuccess, setShowRejectionNoteSuccess] = useState(false);

  // Reset countdown when receipt changes or status changes away from Approved
  useEffect(() => {
    if (receipt?.status !== 'Approved') {
      setCountdown(null);
      setIsProcessing(false);
      setHasStartedCountdown(false);
    }
    // Reset payment countdown when status changes away from Pending Approve
    if (receipt?.status !== 'Pending Approve') {
      setPaymentCountdown(null);
      setHasStartedPaymentCountdown(false);
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

  // Handle payment countdown for Pending Approve status
  useEffect(() => {
    if (hasStartedPaymentCountdown && paymentCountdown !== null && paymentCountdown > 0) {
      const timer = setInterval(() => {
        setPaymentCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            // Auto-pay after countdown
            if (onPay && receipt._id) {
              onPay(receipt._id);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [hasStartedPaymentCountdown, paymentCountdown, onPay, receipt?._id]);

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
        className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white dark:bg-gray-800 shadow-2xl z-50 animate-slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Details</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatAmount(receipt.total_amount)}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <StatusBadge status={receipt.status} isFlagged={receipt.status === 'Rejected'} />
                {receipt.is_modified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800">
                    Modified
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Merchant" value={receipt.merchant_name} />
              <DetailItem label="Employee" value={receipt.employee?.name || 'N/A'} />
              <DetailItem label="Date" value={receipt.receipt_date} />
              <DetailItem label="Category" value={receipt.category} />
              <DetailItem label="Employee ID" value={receipt.employee?.employeeId || 'N/A'} />
            </div>
            {receipt.image_url && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Receipt Image</p>
                <img src={receipt.image_url} className="rounded-xl border border-gray-200 dark:border-gray-700 w-full" alt="Receipt" />
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {status === 'Approved' && (
              <div className="flex flex-col gap-3">
                {countdown !== null && countdown > 0 ? (
                  <div className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Loader2 size={18} className="text-amber-700 dark:text-amber-400 animate-spin" />
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Pending money sending...</p>
                    </div>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{countdown}s</p>
                    <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">Payment will be processed automatically</p>
                  </div>
                ) : countdown === 0 ? (
                  <div className="w-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Processing payment...</p>
                  </div>
                ) : null}
                <button 
                  onClick={() => onUndoApproval(receipt._id)}
                  disabled={countdown !== null && countdown > 0}
                  className="w-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw size={18} />
                  Undo Approval
                </button>
              </div>
            )}

            {status === 'Rejected' && (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => onReopenClaim(receipt._id)}
                  className="w-full bg-brand text-white py-3 rounded-xl font-medium hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText size={18} />
                  Reopen Claim
                </button>
                <button 
                  onClick={() => setShowRejectionNoteModal(true)}
                  className="w-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Send Rejection Note
                </button>
                <button 
                  onClick={() => onArchive(receipt._id)}
                  className="w-full border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 py-3 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Archive size={18} />
                  Archive
                </button>
              </div>
            )}

            {status === 'Paid' && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                No actions available for paid receipts
              </div>
            )}

            {status === 'Pending Approve' && (
              <div className="flex flex-col gap-3">
                {paymentCountdown !== null && paymentCountdown > 0 ? (
                  <div className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Loader2 size={18} className="text-amber-700 dark:text-amber-400 animate-spin" />
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Pending money sending...</p>
                    </div>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{paymentCountdown}s</p>
                    <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">Payment will be processed automatically</p>
                  </div>
                ) : paymentCountdown === 0 ? (
                  <div className="w-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Processing payment...</p>
                  </div>
                ) : null}
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setHasStartedPaymentCountdown(true);
                      setPaymentCountdown(30);
                    }}
                    disabled={paymentCountdown !== null && paymentCountdown > 0}
                    className="flex-1 bg-brand text-white py-3 rounded-xl font-medium hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CreditCard size={18} />
                    Pay via Ryt Bank
                  </button>
                  <button 
                    onClick={() => setShowRejectModal(true)}
                    disabled={paymentCountdown !== null && paymentCountdown > 0}
                    className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-[60] transition-opacity animate-fade-in" 
            onClick={() => setShowRejectModal(false)}
          />
          <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md animate-slide-up border border-gray-200 dark:border-gray-700"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reject Receipt</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter rejection reason (optional)</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rejection Reason
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection (optional)..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand dark:focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                    rows={4}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    // Close rejection modal
                    setShowRejectModal(false);
                    // Show success confirmation
                    setShowRejectSuccess(true);
                    // Process rejection after a brief delay
                    setTimeout(() => {
                      if (onReject && receipt._id) {
                        onReject(receipt._id, rejectionReason || undefined);
                        setRejectionReason('');
                        // Close success modal after 2 seconds
                        setTimeout(() => {
                          setShowRejectSuccess(false);
                        }, 2000);
                      }
                    }, 500);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Rejection Success Confirmation Modal */}
      {showRejectSuccess && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-[70] transition-opacity animate-fade-in" 
          />
          <div 
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md animate-slide-up border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Rejected Success</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  The receipt has been rejected successfully.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Send Rejection Note Modal */}
      {showRejectionNoteModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-[60] transition-opacity animate-fade-in" 
            onClick={() => setShowRejectionNoteModal(false)}
          />
          <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md animate-slide-up border border-gray-200 dark:border-gray-700"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Send Rejection Note</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter rejection note</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rejection Note
                  </label>
                  <textarea
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                    placeholder="Enter rejection note..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand dark:focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                    rows={4}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectionNoteModal(false);
                    setRejectionNote('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    // Close rejection note modal
                    setShowRejectionNoteModal(false);
                    // Show success confirmation
                    setShowRejectionNoteSuccess(true);
                    // Process rejection note after a brief delay
                    setTimeout(() => {
                      if (onSendRejectionNote && receipt._id) {
                        onSendRejectionNote(receipt._id, rejectionNote);
                        setRejectionNote('');
                        // Close success modal after 2 seconds
                        setTimeout(() => {
                          setShowRejectionNoteSuccess(false);
                        }, 2000);
                      }
                    }, 500);
                  }}
                  className="flex-1 px-4 py-2 bg-brand text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Rejection Note Success Confirmation Modal */}
      {showRejectionNoteSuccess && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-[70] transition-opacity animate-fade-in" 
          />
          <div 
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md animate-slide-up border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Rejection Note Sent</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  The rejection note has been sent successfully.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

