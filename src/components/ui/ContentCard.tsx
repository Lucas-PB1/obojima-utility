import React from 'react';

interface ContentCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function ContentCard({ children, title, className = '' }: ContentCardProps) {
  return (
    <div
      className={`glass-panel rounded-3xl p-6 md:p-8 border border-border/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative overflow-hidden group ${className}`}
    >
      <div className="absolute inset-0 border-t border-l border-border/20 pointer-events-none rounded-3xl"></div>

      {title && (
        <h2 className="text-lg md:text-xl font-black text-foreground mb-6 md:mb-8 tracking-tight flex items-center gap-3">
          <span className="w-1.5 h-6 bg-totoro-blue rounded-full"></span>
          {title}
        </h2>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
