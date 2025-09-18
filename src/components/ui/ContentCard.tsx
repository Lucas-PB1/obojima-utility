import React from 'react';

interface ContentCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function ContentCard({ children, title, className = '' }: ContentCardProps) {
  return (
    <div className={`bg-white backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-rose-200 ${className}`}>
      {title && (
        <h2 className="text-2xl font-semibold text-rose-400 mb-6">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
