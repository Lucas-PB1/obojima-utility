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
        ? 'border-gray-300 bg-gray-50' 
        : 'border-rose-200 hover:border-rose-300'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-rose-400 text-lg leading-tight">
          {ingredient.ingredient.nome_portugues}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          ingredient.used 
            ? 'bg-gray-200 text-gray-600' 
            : 'bg-rose-200 text-rose-400'
        }`}>
          {ingredient.used ? 'Usado' : 'Disponível'}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3 italic">
        {ingredient.ingredient.nome_ingles}
      </p>

      <p className="text-sm text-gray-700 mb-4 line-clamp-3">
        {ingredient.ingredient.descricao}
      </p>

      <div className="flex justify-center space-x-2 mb-4">
        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
          ⚔️ {ingredient.ingredient.combat}
        </span>
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
          🛠️ {ingredient.ingredient.utility}
        </span>
        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
          ✨ {ingredient.ingredient.whimsy}
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Coletado em {ingredient.collectedAt.toLocaleDateString('pt-BR')}
      </p>

      {showActions && (
        <div className="flex space-x-2">
          {!ingredient.used && onMarkAsUsed && (
            <Button
              onClick={() => onMarkAsUsed(ingredient.id)}
              variant="success"
              size="sm"
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
            >
              🗑️
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
