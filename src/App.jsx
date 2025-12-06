import { useState } from 'react';
import Sidebar from './components/navigation/Sidebar';
import Header from './components/navigation/Header';
import Dashboard from './pages/Dashboard';
import Policy from './pages/Policy';
import LiveClaims from './pages/LiveClaims';
import ManageEmployee from './pages/ManageEmployee';
import Settings from './pages/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
      case 'Settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      <Sidebar 
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />
        <div className="p-8 max-w-7xl mx-auto w-full flex-1 space-y-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
