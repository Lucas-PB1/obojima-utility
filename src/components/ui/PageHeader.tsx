import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon, className = '', action }: PageHeaderProps) {
  return (
    <div className={`mb-6 md:mb-10 ${className}`}>
      <div className="relative overflow-hidden rounded-lg glass-panel border-transparent shadow-[var(--shadow-raised)]">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-totoro-blue/30 to-transparent"></div>
        </div>

        <div className="relative px-5 py-6 md:px-10 md:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-start md:text-left gap-4 text-center md:text-left w-full">
              {icon && (
                <div className="flex-shrink-0 mb-2 md:mb-0">
                  <div className="w-14 h-14 bg-[var(--surface-muted)] rounded-lg flex items-center justify-center shadow-[inset_0_0_0_1px_var(--hairline),var(--shadow-soft)] border border-transparent relative group backdrop-blur-sm text-totoro-blue">
                    <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
                      {icon}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex flex-col items-center md:items-start">
                <h1 className="text-2xl font-serif font-bold text-totoro-gray mb-2 tracking-tight leading-tight">
                  {title}
                </h1>
                <p className="text-totoro-blue/70 text-[10px] font-bold uppercase tracking-[0.2em] font-sans max-w-[280px] mx-auto md:mx-0 leading-relaxed">
                  {subtitle}
                </p>
              </div>
            </div>

            {action && (
              <div className="flex-shrink-0 w-full md:w-auto">
                <div className="glass-panel !bg-muted/40 p-1.5 rounded-lg border-transparent flex justify-center md:block">
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
