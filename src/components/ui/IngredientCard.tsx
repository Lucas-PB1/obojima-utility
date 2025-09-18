import React from 'react';
import { CollectedIngredient } from '@/types/ingredients';
import Button from './Button';

interface IngredientCardProps {
  ingredient: CollectedIngredient;
  onMarkAsUsed?: (id: string) => void;
  onRemove?: (id: string) => void;
  showActions?: boolean;
}

export default function IngredientCard({ 
  ingredient, 
  onMarkAsUsed, 
  onRemove, 
  showActions = true 
}: IngredientCardProps) {
  return (
    <div className={`bg-white p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
      ingredient.used 
        ? 'border-totoro-gray/30 bg-totoro-gray/5' 
        : 'border-totoro-blue/20 hover:border-totoro-blue/40'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-totoro-gray text-lg leading-tight">
          {ingredient.ingredient.nome_portugues}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          ingredient.used 
            ? 'bg-totoro-gray/20 text-totoro-gray' 
            : 'bg-totoro-green/20 text-totoro-green'
        }`}>
          {ingredient.used ? 'Usado' : 'Disponível'}
        </span>
      </div>

      <p className="text-sm text-totoro-blue mb-3 italic">
        {ingredient.ingredient.nome_ingles}
      </p>

      <p className="text-sm text-totoro-gray mb-4 line-clamp-3">
        {ingredient.ingredient.descricao}
      </p>

      <div className="flex justify-center space-x-2 mb-4">
        <span className="bg-totoro-orange/20 text-totoro-orange px-2 py-1 rounded text-xs font-medium">
          ⚔️ {ingredient.ingredient.combat}
        </span>
        <span className="bg-totoro-blue/20 text-totoro-blue px-2 py-1 rounded text-xs font-medium">
          🛠️ {ingredient.ingredient.utility}
        </span>
        <span className="bg-totoro-yellow/20 text-totoro-yellow px-2 py-1 rounded text-xs font-medium">
          ✨ {ingredient.ingredient.whimsy}
        </span>
      </div>

      <p className="text-xs text-totoro-gray/60 mb-4">
        Coletado em {ingredient.collectedAt.toLocaleDateString('pt-BR')}
      </p>

      {showActions && (
        <div className="flex space-x-2">
          {!ingredient.used && onMarkAsUsed && (
            <Button
              onClick={() => onMarkAsUsed(ingredient.id)}
              variant="success"
              size="sm"
              effect="ripple"
              className="flex-1"
            >
              Usar
            </Button>
          )}
          {onRemove && (
            <Button
              onClick={() => onRemove(ingredient.id)}
              variant="danger"
              size="sm"
              effect="shimmer"
            >
              🗑️
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
