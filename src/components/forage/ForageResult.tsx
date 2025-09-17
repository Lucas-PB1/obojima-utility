import React from 'react';
import { ForageAttempt } from '@/types/ingredients';
import { ingredientsService } from '@/services/ingredientsService';
import ContentCard from '../ui/ContentCard';

interface ForageResultProps {
  result: ForageAttempt | null;
}

export default function ForageResult({ result }: ForageResultProps) {
  if (!result) return null;

  return (
    <ContentCard>
      <div className={`p-6 rounded-xl border-2 ${
        result.success 
          ? 'bg-emerald-50 border-emerald-300' 
          : 'bg-red-50 border-red-300'
      }`}>
        <div className="text-center">
          <div className={`text-4xl mb-2 ${
            result.success ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {result.success ? '🎉' : '😞'}
          </div>
          <h3 className={`text-xl font-bold mb-2 ${
            result.success ? 'text-emerald-800' : 'text-red-800'
          }`}>
            {result.success ? 'Sucesso!' : 'Falha!'}
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Rolagem:</strong> {result.roll}</p>
            <p><strong>DC:</strong> {result.dc}</p>
            <p><strong>Região:</strong> {ingredientsService.getRegionDisplayName(result.region)}</p>
            <p><strong>Raridade:</strong> {result.rarity}</p>
          </div>
          
          {result.success && result.ingredient && (
            <div className="mt-4 p-4 bg-white/90 rounded-lg border border-emerald-200">
              <h4 className="font-bold text-emerald-800 mb-2">
                🎁 Ingrediente Coletado!
              </h4>
              <p className="text-emerald-700 font-medium">
                {result.ingredient.nome_portugues}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {result.ingredient.descricao.substring(0, 100)}...
              </p>
              <div className="flex justify-center space-x-4 mt-2 text-xs">
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                  ⚔️ {result.ingredient.combat}
                </span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  🛠️ {result.ingredient.utility}
                </span>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  ✨ {result.ingredient.whimsy}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ContentCard>
  );
}
