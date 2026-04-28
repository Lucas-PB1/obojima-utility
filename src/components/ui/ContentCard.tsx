import React from 'react';

interface ContentCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function ContentCard({ children, title, className = '' }: ContentCardProps) {
  return (
    <div
      className={`glass-panel rounded-lg p-5 md:p-6 border-transparent shadow-[var(--shadow-raised)] relative overflow-hidden group ${className}`}
    >
      <div className="absolute inset-x-3 top-0 h-px bg-linear-to-r from-transparent via-white/45 to-transparent pointer-events-none"></div>

      {title && (
        <h2 className="text-lg md:text-xl font-black text-foreground mb-6 md:mb-8 tracking-tight flex items-center gap-3">
          <span className="w-1 h-6 bg-totoro-blue rounded-full"></span>
          {title}
        </h2>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
