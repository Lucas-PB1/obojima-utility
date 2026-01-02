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

export function TabNavigation<T = string>({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}: TabNavigationProps<T>) {
  return (
    <div
      className={`glass-panel border-b border-white/20 sticky top-16 z-40 shadow-sm transition-all duration-300 ${className}`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-4 font-medium text-sm transition-all duration-300 border-b-2 relative ${
                activeTab === tab.id
                  ? 'text-totoro-blue border-totoro-blue bg-totoro-blue/10'
                  : 'text-totoro-gray border-transparent hover:text-totoro-blue hover:border-totoro-blue/30 hover:bg-totoro-blue/5'
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
