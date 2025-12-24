import React from 'react';

interface ContentCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

/**
 * Componente de card de conteúdo reutilizável
 * 
 * @description
 * Card básico para agrupar conteúdo com título opcional e estilização consistente.
 * Usado como container principal para seções de conteúdo.
 * 
 * @param children - Conteúdo do card
 * @param title - Título opcional do card
 * @param className - Classes CSS adicionais
 */
export default function ContentCard({ children, title, className = '' }: ContentCardProps) {
  return (
    <div className={`glass-panel rounded-3xl p-8 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative overflow-hidden group ${className}`}>
      {/* Subtle inner highlight */}
      <div className="absolute inset-0 border-t border-l border-white/40 pointer-events-none rounded-3xl"></div>
      
      {title && (
        <h2 className="text-xl font-black text-totoro-gray mb-8 tracking-tight flex items-center gap-3">
          <span className="w-1.5 h-6 bg-totoro-blue rounded-full"></span>
          {title}
        </h2>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
