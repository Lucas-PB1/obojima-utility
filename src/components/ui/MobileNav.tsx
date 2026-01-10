import React from 'react';

interface Tab<T extends string = string> {
  id: T;
  label: string;
  icon: string;
}

interface MobileNavProps<T extends string = string> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (id: T) => void;
}

export function MobileNav<T extends string = string>({
  tabs,
  activeTab,
  onTabChange
}: MobileNavProps<T>) {
  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
      <nav className="glass-panel border border-white/40 shadow-2xl rounded-3xl p-2 flex items-center justify-between overflow-x-auto no-scrollbar bg-white/80 backdrop-blur-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex-1 min-w-[60px] flex flex-col items-center gap-1 py-3 px-1 rounded-2xl transition-all duration-300
              ${activeTab === tab.id ? 'text-white' : 'text-totoro-gray/60 hover:text-totoro-blue'}
            `}
          >
            {activeTab === tab.id && (
              <div className="absolute inset-0 bg-totoro-blue rounded-2xl shadow-lg -z-10 animate-bounce-in"></div>
            )}
            <span
              className={`text-xl transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : ''}`}
            >
              {tab.icon}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
