import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: string;
  className?: string;
}

export default function PageHeader({ title, subtitle, icon, className = '' }: PageHeaderProps) {
  return (
    <div className={`text-center mb-8 ${className}`}>
      <h1 className="text-4xl font-bold text-emerald-800 mb-2">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h1>
      <p className="text-emerald-600 text-lg">
        {subtitle}
      </p>
    </div>
  );
}
