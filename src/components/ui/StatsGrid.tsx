import React from 'react';

interface StatItem {
  value: string | number;
  label: string;
  color: 'emerald' | 'teal' | 'cyan' | 'slate' | 'red' | 'blue' | 'yellow' | 'purple';
}

interface StatsGridProps {
  title: string;
  stats: StatItem[];
  className?: string;
}

const colorClasses = {
  emerald: 'bg-emerald-100 text-emerald-800',
  teal: 'bg-teal-100 text-teal-800',
  cyan: 'bg-cyan-100 text-cyan-800',
  slate: 'bg-slate-100 text-slate-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  purple: 'bg-purple-100 text-purple-800'
};

const textColorClasses = {
  emerald: 'text-emerald-600',
  teal: 'text-teal-600',
  cyan: 'text-cyan-600',
  slate: 'text-slate-600',
  red: 'text-red-600',
  blue: 'text-blue-600',
  yellow: 'text-yellow-600',
  purple: 'text-purple-600'
};

export default function StatsGrid({ title, stats, className = '' }: StatsGridProps) {
  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200 ${className}`}>
      <h2 className="text-2xl font-semibold text-emerald-800 mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`text-center p-4 ${colorClasses[stat.color]} rounded-lg`}>
            <div className={`text-2xl font-bold ${colorClasses[stat.color].split(' ')[1]}`}>
              {stat.value}
            </div>
            <div className={`text-sm ${textColorClasses[stat.color]}`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
