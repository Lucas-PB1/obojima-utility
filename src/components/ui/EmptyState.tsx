import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export default function EmptyState({ icon, title, description, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-16 animate-bounce-in ${className}`}>
      <div className="text-7xl mb-6 animate-float">{icon}</div>
      <h3 className="text-2xl font-black text-totoro-gray mb-3 tracking-tight uppercase">
        {title}
      </h3>
      <p className="text-totoro-blue/50 font-bold max-w-sm mx-auto leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}
