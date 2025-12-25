import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  effect?: 'shimmer' | 'float' | 'pulse-glow' | 'ripple' | 'none';
  title?: string;
}

const variantClasses = {
  primary:
    'bg-gradient-to-br from-totoro-blue via-totoro-blue to-[#357ABD] text-white border-[#5DA9FF] shadow-[0_4px_15px_rgba(74,144,226,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:shadow-[0_8px_25px_rgba(74,144,226,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] transform hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-[var(--input-bg)] text-foreground border-border/50 hover:border-totoro-blue/40 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0',
  success:
    'bg-gradient-to-br from-totoro-green via-totoro-green to-[#6AB31D] text-white border-[#9FE842] shadow-[0_4px_15px_rgba(126,211,33,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:shadow-[0_8px_25px_rgba(126,211,33,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] transform hover:-translate-y-0.5 active:translate-y-0',
  danger:
    'bg-gradient-to-br from-totoro-orange via-totoro-orange to-[#C0661A] text-white border-[#FF9F4D] shadow-[0_4px_15px_rgba(230,126,34,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:shadow-[0_8px_25px_rgba(230,126,34,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] transform hover:-translate-y-0.5 active:translate-y-0',
  ghost:
    'bg-transparent hover:bg-totoro-blue/10 text-foreground border-transparent hover:text-totoro-blue shadow-none transform hover:scale-105 active:scale-95',
  outline:
    'bg-transparent border-2 border-totoro-blue text-totoro-blue hover:bg-totoro-blue hover:text-white shadow-none transform hover:-translate-y-0.5'
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-4 text-base font-bold',
  icon: 'p-2'
};

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false,
  effect = 'shimmer',
  title
}: ButtonProps) {
  const getEffectClasses = () => {
    if (disabled) return '';
    switch (effect) {
      case 'shimmer':
        return 'btn-shimmer';
      case 'float':
        return 'btn-float';
      case 'pulse-glow':
        return 'btn-pulse-glow';
      case 'ripple':
        return 'btn-ripple';
      default:
        return '';
    }
  };

  const baseClasses =
    'relative inline-flex items-center justify-center font-bold tracking-tight rounded-2xl border transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-totoro-blue/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${getEffectClasses()}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {!disabled && (variant === 'primary' || variant === 'success' || variant === 'danger') && (
        <>
          <div className="absolute inset-0 rounded-2xl opacity-40 group-hover:opacity-60 transition-opacity bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.5),transparent_70%)]"></div>
          <div className="absolute inset-[1px] rounded-[15px] border-t border-white/20 pointer-events-none"></div>
        </>
      )}

      {!disabled && variant === 'primary' && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-1 left-4 w-1 h-1 bg-white/40 rounded-full animate-ping"></div>
          <div className="absolute bottom-2 right-6 w-0.5 h-0.5 bg-white/20 rounded-full animate-pulse delay-75"></div>
        </div>
      )}

      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
