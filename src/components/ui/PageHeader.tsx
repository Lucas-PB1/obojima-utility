import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: string;
  className?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon, className = '', action }: PageHeaderProps) {
  return (
    <div className={`mb-6 md:mb-10 ${className}`}>
      <div className="relative overflow-hidden rounded-3xl glass-panel border border-border/40 shadow-xl">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-totoro-blue/10 rounded-full blur-[60px]"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-totoro-green/10 rounded-full blur-[60px]"></div>
        </div>

        <div className="relative px-5 py-6 md:px-10 md:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-start md:text-left gap-4 text-center md:text-left w-full">
              {icon && (
                <div className="flex-shrink-0 animate-float mb-2 md:mb-0">
                  <div className="w-20 h-20 bg-white/50 rounded-2xl flex items-center justify-center shadow-lg border border-white/60 relative group backdrop-blur-sm">
                    <div className="absolute inset-0 bg-totoro-blue/5 rounded-2xl scale-90 group-hover:scale-110 transition-transform duration-500"></div>
                    <span className="text-4xl relative z-10 transition-transform duration-500 group-hover:scale-110">
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
                <div className="glass-panel !bg-muted/40 p-1.5 rounded-2xl border border-border/40 flex justify-center md:block">
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
