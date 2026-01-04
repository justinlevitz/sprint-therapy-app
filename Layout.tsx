
import React from 'react';
import { AppTab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  clientName?: string;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, clientName, activeTab, setActiveTab, onLogout }) => {
  return (
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-xl flex flex-col relative overflow-hidden">
      {/* Header */}
      {clientName && (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Welcome back</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Hello, {clientName}</h1>
          </div>
          <button 
            onClick={onLogout}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </header>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24 ios-scrolling bg-gray-50/30">
        {children}
      </main>

      {/* Navigation */}
      {clientName && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-lg border-t border-gray-100 px-8 py-4 flex justify-between items-center z-40">
           <button 
             onClick={() => setActiveTab('today')}
             className={`flex flex-col items-center transition-all ${activeTab === 'today' ? 'text-indigo-600' : 'text-gray-300'}`}
           >
             <i className={`fas fa-calendar-day text-xl`}></i>
             <span className="text-[10px] mt-1 font-bold">Today</span>
           </button>
           <button 
             onClick={() => setActiveTab('history')}
             className={`flex flex-col items-center transition-all ${activeTab === 'history' ? 'text-indigo-600' : 'text-gray-300'}`}
           >
             <i className={`fas fa-history text-xl`}></i>
             <span className="text-[10px] mt-1 font-bold">History</span>
           </button>
           <button 
             onClick={() => setActiveTab('tools')}
             className={`flex flex-col items-center transition-all ${activeTab === 'tools' ? 'text-indigo-600' : 'text-gray-300'}`}
           >
             <i className={`fas fa-lightbulb text-xl`}></i>
             <span className="text-[10px] mt-1 font-bold">Tools</span>
           </button>
        </nav>
      )}
    </div>
  );
};

export default Layout;
