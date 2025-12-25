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

const colorClasses = {
  'totoro-blue': 'bg-totoro-blue/20 text-totoro-blue',
  'totoro-green': 'bg-totoro-green/20 text-totoro-green',
  'totoro-yellow': 'bg-totoro-yellow/20 text-totoro-yellow',
  'totoro-gray': 'bg-totoro-gray/20 text-totoro-gray',
  'totoro-orange': 'bg-totoro-orange/20 text-totoro-orange'
};

const textColorClasses = {
  'totoro-blue': 'text-totoro-blue',
  'totoro-green': 'text-totoro-green',
  'totoro-yellow': 'text-totoro-yellow',
  'totoro-gray': 'text-totoro-gray',
  'totoro-orange': 'text-totoro-orange'
};

export default function StatsGrid({ title, stats, className = '' }: StatsGridProps) {
  return (
    <div
      className={`glass-panel rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-8 border border-white/40 relative overflow-hidden group ${className}`}
    >
      <div className="absolute inset-0 border-t border-l border-white/40 pointer-events-none rounded-3xl"></div>
      <h2 className="text-xl font-black text-totoro-gray mb-8 tracking-tight flex items-center gap-3 relative z-10">
        <span className="w-1.5 h-6 bg-totoro-blue rounded-full"></span>
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        {stats.map((stat, index) => (
          <div key={index} className={`text-center p-4 ${colorClasses[stat.color]} rounded-lg`}>
            <div className={`text-2xl font-bold ${colorClasses[stat.color].split(' ')[1]}`}>
              {stat.value}
            </div>
            <div className={`text-sm ${textColorClasses[stat.color]}`}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
