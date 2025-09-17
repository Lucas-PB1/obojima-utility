import React, { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}: ModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Pequeno delay para garantir que o DOM foi atualizado
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Aguardar animação de saída antes de remover do DOM
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop com efeito de blur e gradiente */}
      <div 
        className={`fixed inset-0 bg-gradient-to-br from-emerald-900/20 via-teal-900/30 to-cyan-900/20 backdrop-blur-sm transition-all duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal com animação flutuante */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full ${sizeClasses[size]} transform transition-all duration-300 ${
            isAnimating 
              ? 'scale-100 opacity-100 translate-y-0' 
              : 'scale-95 opacity-0 translate-y-4'
          }`}
        >
          {/* Sombra flutuante */}
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-cyan-400/20 rounded-3xl blur-xl"></div>
          
          {/* Modal principal */}
          <div className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm shadow-2xl border border-white/20">
            {/* Header com gradiente suave */}
            <div className="bg-gradient-to-r from-emerald-50/80 via-teal-50/80 to-cyan-50/80 px-6 py-4 border-b border-emerald-200/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-emerald-800">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-emerald-500 hover:text-emerald-700 transition-colors p-1 rounded-full hover:bg-emerald-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 bg-white/80 backdrop-blur-sm">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
