import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Layout base para páginas
 * 
 * @description
 * Layout principal que envolve o conteúdo das páginas com gradiente de fundo,
 * padding e container centralizado. Base para todas as páginas do sistema.
 * 
 * @param children - Conteúdo da página
 * @param className - Classes CSS adicionais
 */
export default function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-totoro-blue/10 to-totoro-green/10 p-6 transition-all duration-300 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </div>
  );
}
