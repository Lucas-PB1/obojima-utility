import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  effect?: 'shimmer' | 'float' | 'pulse-glow' | 'ripple' | 'none';
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-totoro-blue to-totoro-blue/80 hover:from-totoro-blue/90 hover:to-totoro-blue/70 shadow-lg shadow-totoro-blue/25 hover:shadow-xl hover:shadow-totoro-blue/30 transform hover:scale-105 active:scale-95',
  secondary: 'bg-gradient-to-r from-totoro-green/20 to-totoro-green/10 hover:from-totoro-green/30 hover:to-totoro-green/20 text-totoro-gray border border-totoro-green/30 hover:border-totoro-green/50 shadow-md shadow-totoro-green/10 hover:shadow-lg hover:shadow-totoro-green/20 transform hover:scale-105 active:scale-95',
  danger: 'bg-gradient-to-r from-totoro-orange to-totoro-orange/80 hover:from-totoro-orange/90 hover:to-totoro-orange/70 shadow-lg shadow-totoro-orange/25 hover:shadow-xl hover:shadow-totoro-orange/30 transform hover:scale-105 active:scale-95',
  success: 'bg-gradient-to-r from-totoro-green to-totoro-green/80 hover:from-totoro-green/90 hover:to-totoro-green/70 shadow-lg shadow-totoro-green/25 hover:shadow-xl hover:shadow-totoro-green/30 transform hover:scale-105 active:scale-95'
};

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
};

/**
 * Componente de botão reutilizável com efeitos visuais
 * 
 * @description
 * Botão customizado com múltiplas variantes, tamanhos e efeitos visuais
 * incluindo animações e estados de hover/focus.
 * 
 * @param children - Conteúdo do botão
 * @param onClick - Função executada ao clicar
 * @param type - Tipo do botão HTML
 * @param variant - Variante visual do botão
 * @param size - Tamanho do botão
 * @param disabled - Se o botão está desabilitado
 * @param className - Classes CSS adicionais
 * @param fullWidth - Se o botão ocupa toda a largura
 * @param effect - Efeito visual aplicado
 */
export default function Button({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false,
  effect = 'shimmer'
}: ButtonProps) {
  /**
   * Retorna as classes CSS para o efeito visual selecionado
   */
  const getEffectClasses = () => {
    if (disabled) return '';
    switch (effect) {
      case 'shimmer': return 'btn-shimmer';
      case 'float': return 'btn-float';
      case 'pulse-glow': return 'btn-pulse-glow';
      case 'ripple': return 'btn-ripple';
      default: return '';
    }
  };

  const baseClasses = 'border font-medium rounded-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-totoro-blue/50 focus:ring-offset-2 relative overflow-hidden group';
  const disabledClasses = 'disabled:bg-gradient-to-r disabled:from-totoro-gray/30 disabled:to-totoro-gray/20 disabled:cursor-not-allowed disabled:hover:from-totoro-gray/30 disabled:hover:to-totoro-gray/20 disabled:shadow-none disabled:transform-none disabled:hover:scale-100 disabled:active:scale-100';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabledClasses}
        ${getEffectClasses()}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {!disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
      )}
      
      {!disabled && variant === 'primary' && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-1 left-2 w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
          <div className="absolute top-3 right-3 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse delay-100"></div>
          <div className="absolute bottom-2 left-4 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse delay-200"></div>
        </div>
      )}

      {!disabled && variant === 'secondary' && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-totoro-green/10 via-transparent to-totoro-green/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        </div>
      )}

      {!disabled && variant === 'danger' && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-totoro-orange/60 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1 left-1/3 w-1 h-1 bg-totoro-orange/40 rounded-full animate-pulse delay-150"></div>
          <div className="absolute bottom-1 right-1/3 w-1 h-1 bg-totoro-orange/40 rounded-full animate-pulse delay-300"></div>
        </div>
      )}

      {!disabled && variant === 'success' && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-2 left-3 text-xs opacity-60 animate-bounce">🍃</div>
          <div className="absolute top-1 right-2 text-xs opacity-40 animate-bounce delay-200">🌿</div>
          <div className="absolute bottom-2 left-2 text-xs opacity-50 animate-bounce delay-400">🍀</div>
        </div>
      )}
      
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
    </button>
  );
}
