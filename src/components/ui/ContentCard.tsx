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
    <div className={`bg-white backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-totoro-blue/20 ${className}`}>
      {title && (
        <h2 className="text-2xl font-semibold text-totoro-gray mb-6">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
