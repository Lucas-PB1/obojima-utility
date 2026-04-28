'use client';
import { motion } from 'motion/react';
import { Tab } from '@/hooks/useApp';

interface MainTabNavProps {
  tabs: Tab[];
  activeTab: Tab['id'];
  onTabChange: (tabId: Tab['id']) => void;
}

export function MainTabNav({ tabs, activeTab, onTabChange }: MainTabNavProps) {
  return (
    <nav className="mt-6 hidden md:flex items-center justify-center overflow-x-auto pb-1 no-scrollbar">
      <div className="flex p-1.5 bg-totoro-blue/10 rounded-lg backdrop-blur-md shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.12)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-4 py-2 md:px-5 md:py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 select-none font-sans whitespace-nowrap
              ${
                activeTab === tab.id
                  ? 'text-white shadow-md'
                  : 'text-totoro-gray/55 hover:text-totoro-blue hover:bg-[var(--surface-hover)]'
              }
            `}
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="opacity-80">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="desktop-nav-active"
                className="absolute inset-0 bg-totoro-blue rounded-lg shadow-[0_14px_28px_-18px_rgba(var(--primary-rgb),0.85),inset_0_1px_0_rgba(255,255,255,0.24)]"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
