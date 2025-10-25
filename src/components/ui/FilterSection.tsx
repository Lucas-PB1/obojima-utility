import React from 'react';

interface FilterSectionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente de seção de filtros
 * 
 * @description
 * Container estilizado para agrupar controles de filtro com design consistente.
 * Usado para organizar filtros em seções visuais distintas.
 * 
 * @param children - Conteúdo da seção de filtros
 * @param className - Classes CSS adicionais
 */
export default function FilterSection({ children, className = '' }: FilterSectionProps) {
  return (
    <div className={`bg-white backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-totoro-blue/20 ${className}`}>
      {children}
    </div>
  );
}
