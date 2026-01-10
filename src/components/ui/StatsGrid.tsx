import React from 'react';

interface StatItem {
  value: string | number;
  label: string;
  color: 'totoro-blue' | 'totoro-green' | 'totoro-yellow' | 'totoro-gray' | 'totoro-orange';
}

interface StatsGridProps {
  title: string;
  stats: StatItem[];
  className?: string;
}

const textColorClasses = {
  'totoro-blue': 'text-totoro-blue',
  'totoro-green': 'text-totoro-green',
  'totoro-yellow': 'text-totoro-yellow',
  'totoro-gray': 'text-foreground/40',
  'totoro-orange': 'text-totoro-orange'
};

export function StatsGrid({ title, stats, className = '' }: StatsGridProps) {
  return (
    <div
      className={`glass-panel rounded-3xl shadow-xl p-6 bg-white/80 backdrop-blur-xl border border-white/60 relative overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-totoro-blue rounded-full"></div>
        <h2 className="text-xl font-black text-totoro-gray tracking-tight">{title}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 relative z-10">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className={`text-2xl md:text-3xl font-black mb-1 ${textColorClasses[stat.color]}`}>
              {stat.value}
            </div>
            <div
              className={`text-[10px] uppercase font-bold tracking-wider leading-tight max-w-[100px] ${textColorClasses[stat.color]}`}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
