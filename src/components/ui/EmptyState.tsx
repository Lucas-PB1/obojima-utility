import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

/**
 * Componente de estado vazio
 * 
 * @description
 * Exibe um estado vazio com ícone, título e descrição quando não há dados
 * para mostrar. Usado para melhorar a experiência do usuário.
 * 
 * @param icon - Ícone emoji ou símbolo para o estado vazio
 * @param title - Título do estado vazio
 * @param description - Descrição explicativa
 * @param className - Classes CSS adicionais
 */
export default function EmptyState({ icon, title, description, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-totoro-gray mb-2">
        {title}
      </h3>
      <p className="text-totoro-gray/60">
        {description}
      </p>
    </div>
  );
}
