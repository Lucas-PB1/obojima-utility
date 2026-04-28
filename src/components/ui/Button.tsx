import React from 'react';
import { motion } from 'motion/react';

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
    'bg-totoro-blue text-white border-transparent shadow-[var(--shadow-soft)] hover:shadow-[0_18px_36px_-24px_rgba(var(--primary-rgb),0.62)]',
  secondary:
    'bg-[var(--surface-raised)] text-foreground border-transparent ring-1 ring-inset ring-[color:var(--hairline)] hover:bg-[var(--surface-hover)] hover:ring-totoro-blue/30 shadow-[var(--shadow-soft)]',
  success:
    'bg-totoro-green text-white border-transparent shadow-[var(--shadow-soft)] hover:shadow-[0_18px_36px_-24px_rgba(var(--success-rgb),0.62)]',
  danger:
    'bg-totoro-orange text-white border-transparent shadow-[var(--shadow-soft)] hover:shadow-[0_18px_36px_-24px_rgba(var(--danger-rgb),0.62)]',
  ghost:
    'bg-transparent hover:bg-totoro-blue/10 text-foreground border-transparent hover:text-totoro-blue shadow-none',
  outline:
    'bg-transparent border-transparent ring-1 ring-inset ring-totoro-blue/35 text-totoro-blue hover:bg-totoro-blue hover:text-white hover:ring-totoro-blue shadow-none'
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-4 text-base font-bold',
  icon: 'p-2'
};

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false,
  effect = 'none',
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
    'group relative inline-flex items-center justify-center font-bold tracking-tight rounded-lg border transition-all duration-200 ease-out focus:outline-none focus:ring-4 focus:ring-totoro-blue/20 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
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
          <div className="absolute inset-0 rounded-lg opacity-30 group-hover:opacity-50 transition-opacity bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.5),transparent_70%)]"></div>
          <div className="absolute inset-[1px] rounded-[7px] pointer-events-none shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]"></div>
        </>
      )}

      {!disabled && variant === 'primary' && (
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-1 left-4 w-1 h-1 bg-white/40 rounded-full animate-ping"></div>
          <div className="absolute bottom-2 right-6 w-0.5 h-0.5 bg-white/20 rounded-full animate-pulse delay-75"></div>
        </div>
      )}

      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
