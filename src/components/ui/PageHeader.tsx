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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-cyan-50/80 backdrop-blur-sm border border-emerald-200/50 shadow-lg">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-4 left-4 w-16 h-16 bg-emerald-200/20 rounded-full blur-xl"></div>
          <div className="absolute top-8 right-8 w-12 h-12 bg-teal-200/20 rounded-full blur-lg"></div>
          <div className="absolute bottom-4 left-1/4 w-8 h-8 bg-cyan-200/20 rounded-full blur-md"></div>
        </div>
        
        <div className="relative px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Lado esquerdo - Título */}
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                {icon && (
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center shadow-lg border border-emerald-200/50">
                      <span className="text-3xl filter drop-shadow-sm">{icon}</span>
                    </div>
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-800 bg-clip-text text-transparent mb-1">
                    {title}
                  </h1>
                  <p className="text-emerald-600/80 text-base font-medium">
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
        <div className="h-1 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300"></div>
      </div>
    </div>
  );
}
