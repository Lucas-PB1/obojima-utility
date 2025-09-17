import React from 'react';

interface ContentCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function ContentCard({ children, title, className = '' }: ContentCardProps) {
  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200 ${className}`}>
      {title && (
        <h2 className="text-2xl font-semibold text-emerald-800 mb-6">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
