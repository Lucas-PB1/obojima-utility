import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'simple';
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
 * @param variant - 'default' para layout completo com fundo, 'simple' para apenas container e padding
 */
export default function PageLayout({ children, className = '', variant = 'default' }: PageLayoutProps) {
  if (variant === 'simple') {
    return (
      <div className={`max-w-7xl mx-auto px-6 py-8 transition-all duration-300 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-totoro-blue/10 to-totoro-green/10 p-6 transition-all duration-300 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}
