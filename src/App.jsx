import { useState, useEffect } from 'react';
import Sidebar from './components/navigation/Sidebar';
import Header from './components/navigation/Header';
import Dashboard from './pages/Dashboard';
import Policy from './pages/Policy';
import LiveClaims from './pages/LiveClaims';
import ManageEmployee from './pages/ManageEmployee';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Initialize darkMode from localStorage or default to false
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Apply dark mode on mount and when it changes
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Save preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const renderPage = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Policy':
        return <Policy />;
      case 'Live Claims':
        return <LiveClaims />;
      case 'Manage Employee':
        return <ManageEmployee />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex font-sans text-gray-900 dark:text-white transition-colors duration-200">
      <Sidebar 
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
        <div className="p-8 max-w-7xl mx-auto w-full flex-1 space-y-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
