import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: string;
  className?: string;
  action?: React.ReactNode;
}

/**
 * Componente de cabeçalho de página
 * 
 * @description
 * Cabeçalho estilizado para páginas com título, subtítulo, ícone opcional
 * e área para ações adicionais. Inclui efeitos visuais e backdrop blur.
 * 
 * @param title - Título principal da página
 * @param subtitle - Subtítulo descritivo
 * @param icon - Ícone opcional para o cabeçalho
 * @param className - Classes CSS adicionais
 * @param action - Elemento de ação opcional (botão, etc.)
 */
export default function PageHeader({ title, subtitle, icon, className = '', action }: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="relative overflow-hidden rounded-3xl bg-white backdrop-blur-md border border-totoro-blue/20 shadow-lg shadow-totoro-blue/10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-4 left-4 w-16 h-16 bg-totoro-blue/20 rounded-full blur-xl"></div>
          <div className="absolute top-8 right-8 w-12 h-12 bg-totoro-green/20 rounded-full blur-lg"></div>
          <div className="absolute bottom-4 left-1/4 w-8 h-8 bg-totoro-yellow/20 rounded-full blur-md"></div>
        </div>
        
        <div className="relative px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                {icon && (
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-totoro-blue/20 rounded-3xl flex items-center justify-center shadow-lg border border-totoro-blue/30 backdrop-blur-sm">
                      <span className="text-4xl filter drop-shadow-sm">{icon}</span>
                    </div>
                  </div>
                )}
                <div>
                  <h1 className="text-4xl font-bold text-totoro-gray mb-2">
                    {title}
                  </h1>
                  <p className="text-totoro-blue text-lg font-medium">
                    {subtitle}
                  </p>
                </div>
              </div>
            </div>
            
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        </div>
        
        <div className="h-1 bg-totoro-blue/30"></div>
      </div>
    </div>
  );
}
