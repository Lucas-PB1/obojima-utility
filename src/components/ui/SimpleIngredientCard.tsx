import React from 'react';
import { Ingredient } from '@/types/ingredients';

interface SimpleIngredientCardProps {
  ingredient: Ingredient;
  className?: string;
}

export default function SimpleIngredientCard({ 
  ingredient, 
  className = ''
}: SimpleIngredientCardProps) {
  return (
    <div className={`bg-white p-4 rounded-lg border-2 border-totoro-blue/20 transition-all duration-300 hover:shadow-lg ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-totoro-gray text-sm leading-tight">
          {ingredient.nome_portugues}
        </h3>
      </div>

      <p className="text-xs text-totoro-blue mb-2 italic">
        {ingredient.nome_ingles}
      </p>

      <p className="text-xs text-totoro-gray mb-3 line-clamp-2">
        {ingredient.descricao}
      </p>

      <div className="flex justify-center space-x-1">
        <span className="bg-totoro-orange/20 text-totoro-orange px-2 py-1 rounded text-xs font-medium">
          ⚔️ {ingredient.combat}
        </span>
        <span className="bg-totoro-blue/20 text-totoro-blue px-2 py-1 rounded text-xs font-medium">
          🛠️ {ingredient.utility}
        </span>
        <span className="bg-totoro-yellow/20 text-totoro-yellow px-2 py-1 rounded text-xs font-medium">
          ✨ {ingredient.whimsy}
        </span>
      </div>
    </div>
  );
}
