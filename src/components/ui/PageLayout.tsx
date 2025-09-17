import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </div>
  );
}
