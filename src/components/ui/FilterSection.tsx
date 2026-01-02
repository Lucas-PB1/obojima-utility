import React from 'react';

interface FilterSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterSection({ children, className = '' }: FilterSectionProps) {
  return (
    <div
      className={`glass-panel rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-8 border border-white/40 relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 border-t border-l border-white/40 pointer-events-none rounded-3xl"></div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
