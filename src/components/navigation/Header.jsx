import { Search, Bell, Moon, Sun } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Header({ darkMode, setDarkMode }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);

  // Dummy notifications for the last 24 hours
  const getDummyNotifications = () => {
    const now = new Date();
    const notifications = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000); // Random time in last 24h
      notifications.push({
        id: i,
        message: `New claim submitted by Employee ${100 + i}`,
        time: date.toLocaleTimeString(),
        date: date.toLocaleDateString(),
        read: Math.random() > 0.5,
      });
    }
    return notifications.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
  };

  const dummyNotifications = getDummyNotifications();

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

        <button className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white">
          <Search size={20} />
        </button>
        
        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Bell size={20} />
            {dummyNotifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-50 dark:border-gray-900"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-up">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">{dummyNotifications.filter(n => !n.read).length} unread</span>
              </div>
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {dummyNotifications.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">No new notifications.</p>
                ) : (
                  dummyNotifications.map(notification => (
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
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                <button className="text-sm text-brand hover:underline dark:text-blue-400">View All</button>
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

