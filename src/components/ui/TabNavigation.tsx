import React from 'react';

interface Tab<T = string> {
  id: T;
  label: string;
  icon: string;
}

interface TabNavigationProps<T = string> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  className?: string;
}

export default function TabNavigation<T = string>({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = '' 
}: TabNavigationProps<T>) {
  return (
    <div className={`bg-white backdrop-blur-md border-b border-rose-200 sticky top-16 z-40 shadow-sm ${className}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex">
          {tabs.map((tab, index) => (
            <button
              key={index}
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
