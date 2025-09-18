import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export default function EmptyState({ icon, title, description, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-totoro-gray mb-2">
        {title}
      </h3>
      <p className="text-totoro-gray/60">
        {description}
      </p>
    </div>
  );
}
