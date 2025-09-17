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
    <div className={`bg-white/90 backdrop-blur-sm border-b border-emerald-200 sticky top-16 z-40 ${className}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-4 font-medium text-sm transition-all duration-200 border-b-2 relative ${
                activeTab === tab.id
                  ? 'text-emerald-700 border-emerald-500 bg-emerald-50'
                  : 'text-gray-600 border-transparent hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-25'
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
