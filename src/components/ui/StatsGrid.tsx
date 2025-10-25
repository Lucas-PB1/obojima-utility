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

/**
 * Componente de grid de estatísticas
 * 
 * @description
 * Grid responsivo para exibir estatísticas com valores e labels coloridos.
 * Suporta diferentes cores do tema Totoro e layout adaptativo.
 * 
 * @param title - Título da seção de estatísticas
 * @param stats - Array de itens de estatística
 * @param className - Classes CSS adicionais
 */
export default function StatsGrid({ title, stats, className = '' }: StatsGridProps) {
  return (
    <div className={`bg-white backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-totoro-blue/20 ${className}`}>
      <h2 className="text-2xl font-semibold text-totoro-gray mb-4">{title}</h2>
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
