import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'simple';
}

export function PageLayout({ children, className = '', variant = 'default' }: PageLayoutProps) {
  if (variant === 'simple') {
    return (
      <div className={`max-w-7xl mx-auto px-6 py-8 transition-all duration-300 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-totoro-blue/10 to-totoro-green/10 p-6 transition-all duration-300 ${className}`}
    >
      <div className="max-w-7xl mx-auto">{children}</div>
    </div>
  );
}
