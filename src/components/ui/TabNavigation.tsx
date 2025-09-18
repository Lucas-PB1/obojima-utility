import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export default function TabNavigation({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = '' 
}: TabNavigationProps) {
  return (
    <div className={`bg-white backdrop-blur-md border-b border-rose-200 sticky top-16 z-40 shadow-sm ${className}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-4 font-medium text-sm transition-all duration-300 border-b-2 relative ${
                activeTab === tab.id
                  ? 'text-rose-400 border-rose-300 bg-rose-50'
                  : 'text-gray-600 border-transparent hover:text-rose-300 hover:border-rose-200 hover:bg-rose-50'
              }`}
            >
              <span className="flex items-center">
                <span className="mr-2 text-base">{tab.icon}</span>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
