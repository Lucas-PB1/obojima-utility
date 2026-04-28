import React from 'react';
import { motion } from 'motion/react';

interface Tab<T extends string = string> {
  id: T;
  label: string;
  icon: React.ReactNode;
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
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 pb-[env(safe-area-inset-bottom)]">
      <nav className="glass-panel border-transparent shadow-[var(--shadow-raised)] rounded-lg p-1.5 flex items-center justify-between overflow-x-auto no-scrollbar bg-[var(--surface-raised)] backdrop-blur-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            aria-label={tab.label}
            className={`
              relative flex-1 min-w-[56px] min-h-[52px] flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-colors duration-200
              ${activeTab === tab.id ? 'text-white' : 'text-totoro-gray/60 hover:text-totoro-blue'}
            `}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="mobile-nav-active"
                className="absolute inset-0 bg-totoro-blue rounded-lg shadow-[0_14px_28px_-18px_rgba(var(--primary-rgb),0.85)] -z-10"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span
              className={`transition-transform duration-200 ${activeTab === tab.id ? 'scale-110' : ''}`}
            >
              {tab.icon}
            </span>
            <span className="sr-only">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
