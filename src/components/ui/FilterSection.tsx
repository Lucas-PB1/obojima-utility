import React from 'react';

interface FilterSectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function FilterSection({ children, className = '' }: FilterSectionProps) {
  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200 ${className}`}>
      {children}
    </div>
  );
}
