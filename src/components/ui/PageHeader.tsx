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
    <div className={`mb-10 ${className}`}>
      <div className="relative overflow-hidden rounded-3xl glass-panel border border-white/60 shadow-xl">
        {/* Decorative background aura */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-totoro-blue/10 rounded-full blur-[60px]"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-totoro-green/10 rounded-full blur-[60px]"></div>
        </div>
        
        <div className="relative px-10 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              {icon && (
                <div className="flex-shrink-0 animate-float">
                  <div className="w-20 h-20 bg-white/80 rounded-2xl flex items-center justify-center shadow-lg border border-white relative group">
                    <div className="absolute inset-0 bg-totoro-blue/5 rounded-2xl scale-90 group-hover:scale-110 transition-transform duration-500"></div>
                    <span className="text-4xl relative z-10 transition-transform duration-500 group-hover:scale-110">{icon}</span>
                  </div>
                </div>
              )}
              <div>
                <h1 className="text-4xl font-serif font-bold text-totoro-gray mb-2 tracking-tight leading-tight">
                  {title}
                </h1>
                <p className="text-totoro-blue/80 text-xs font-semibold uppercase tracking-[0.2em] font-sans">
                  {subtitle}
                </p>
              </div>
            </div>
            
            {action && (
              <div className="flex-shrink-0 w-full md:w-auto">
                <div className="glass-panel !bg-white/40 p-1.5 rounded-2xl border border-white/40">
                  {action}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
