import React from 'react';

interface FilterSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterSection({ children, className = '' }: FilterSectionProps) {
  return (
    <div
      className={`glass-panel rounded-lg shadow-[var(--shadow-raised)] p-6 border-transparent relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-x-3 top-0 h-px bg-linear-to-r from-transparent via-white/45 to-transparent pointer-events-none"></div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
