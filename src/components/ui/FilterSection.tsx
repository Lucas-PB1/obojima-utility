import React from 'react';

interface FilterSectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function FilterSection({ children, className = '' }: FilterSectionProps) {
  return (
    <div className={`bg-white backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-rose-200 ${className}`}>
      {children}
    </div>
  );
}
