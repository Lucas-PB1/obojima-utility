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
      className={`glass-panel subtle-divider-bottom sticky top-16 z-40 shadow-(--shadow-soft)] transition-all duration-300 ${className}`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-4 font-medium text-sm transition-all duration-300 relative ${
                activeTab === tab.id
                  ? 'text-totoro-blue bg-totoro-blue/10 shadow-[inset_0_-2px_0_var(--totoro-blue)]'
                  : 'text-totoro-gray hover:text-totoro-blue hover:bg-totoro-blue/5'
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
