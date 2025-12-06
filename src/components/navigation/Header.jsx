import { Bell, Moon, Sun } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function Header({ darkMode, setDarkMode }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);
  const receiptsData = useQuery(api.receipts.get);

  // Get notifications from receipts in the past 24 hours with "Pending Approve" status
  const notifications = useMemo(() => {
    if (!receiptsData || receiptsData.length === 0) return [];

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const pendingReceipts = receiptsData
      .filter(receipt => {
        if (receipt.status !== 'Pending Approve') return false;
        
        // Check if receipt_date is within the last 24 hours
        if (receipt.receipt_date) {
          const receiptDate = new Date(receipt.receipt_date);
          return receiptDate >= twentyFourHoursAgo && receiptDate <= now;
        }
        
        // Fallback to submission_date if receipt_date is not available
        if (receipt.submission_date) {
          const submissionDate = new Date(receipt.submission_date);
          return submissionDate >= twentyFourHoursAgo && submissionDate <= now;
        }
        
        return false;
      })
      .map(receipt => {
        const receiptDate = receipt.receipt_date ? new Date(receipt.receipt_date) : new Date(receipt.submission_date);
        return {
          id: receipt._id,
          message: `${receipt.employee_name || 'Employee'} just submitted a receipt and is pending for approval`,
          time: receiptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          date: receiptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          timestamp: receiptDate.getTime(),
          read: false,
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp); // Sort by most recent first

    return pendingReceipts;
  }, [receiptsData]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="h-16 px-8 flex items-center justify-between sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm dark:border-gray-800">
      <div className="flex-1"></div>
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Bell size={20} />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-50 dark:border-gray-900"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-up">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">{notifications.filter(n => !n.read).length} unread</span>
              </div>
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">No new notifications.</p>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${notification.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'} transition-colors cursor-pointer`}
                    >
                      <p className={`text-sm ${notification.read ? 'text-gray-800 dark:text-gray-200' : 'font-medium text-blue-800 dark:text-blue-200'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {notification.date} at {notification.time}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-medium">
          JD
        </div>
      </div>
    </header>
  );
}

