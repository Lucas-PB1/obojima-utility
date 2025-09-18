import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: string;
  className?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, icon, className = '', action }: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      {/* Background decorativo */}
      <div className="relative overflow-hidden rounded-3xl bg-white backdrop-blur-md border border-rose-200 shadow-lg shadow-rose-100/20">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-4 left-4 w-16 h-16 bg-rose-100/30 rounded-full blur-xl"></div>
          <div className="absolute top-8 right-8 w-12 h-12 bg-pink-100/25 rounded-full blur-lg"></div>
          <div className="absolute bottom-4 left-1/4 w-8 h-8 bg-purple-100/20 rounded-full blur-md"></div>
        </div>
        
        <div className="relative px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Lado esquerdo - Título */}
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                {icon && (
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center shadow-lg border border-rose-200 backdrop-blur-sm">
                      <span className="text-4xl filter drop-shadow-sm">{icon}</span>
                    </div>
                  </div>
                )}
                <div>
                  <h1 className="text-4xl font-bold text-rose-400 mb-2">
                    {title}
                  </h1>
                  <p className="text-rose-300 text-lg font-medium">
                    {subtitle}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Lado direito - Ações */}
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        </div>
        
        {/* Linha decorativa inferior */}
        <div className="h-1 bg-rose-200"></div>
      </div>
    </div>
  );
}
