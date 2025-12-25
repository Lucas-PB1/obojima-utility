import React from 'react';
import Modal from '@/components/ui/Modal';
import { Ingredient } from '@/types/ingredients';

interface IngredientModalProps {
  ingredient: Ingredient | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function IngredientModal({ ingredient, isOpen, onClose }: IngredientModalProps) {
  if (!ingredient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`🌿 ${ingredient.nome_portugues}`} size="lg">
      <div className="space-y-6">
        <div className="text-center">
          <h4 className="text-lg font-medium text-totoro-gray mb-2">{ingredient.nome_ingles}</h4>
          <div className="w-16 h-1 bg-gradient-to-r from-totoro-green to-totoro-blue mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-totoro-orange/20 border border-totoro-orange/30 rounded-lg p-4 text-center">
            <div className="text-totoro-orange text-sm font-medium mb-1">⚔️ Combat</div>
            <div className="text-2xl font-bold text-totoro-orange">{ingredient.combat}</div>
          </div>
          <div className="bg-totoro-blue/20 border border-totoro-blue/30 rounded-lg p-4 text-center">
            <div className="text-totoro-blue text-sm font-medium mb-1">🛠️ Utility</div>
            <div className="text-2xl font-bold text-totoro-blue">{ingredient.utility}</div>
          </div>
          <div className="bg-totoro-yellow/20 border border-totoro-yellow/30 rounded-lg p-4 text-center">
            <div className="text-totoro-yellow text-sm font-medium mb-1">✨ Whimsy</div>
            <div className="text-2xl font-bold text-totoro-yellow">{ingredient.whimsy}</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-totoro-green/10 to-totoro-blue/10 rounded-lg p-6 border border-totoro-green/20">
          <h5 className="font-semibold text-totoro-gray mb-3 flex items-center">
            <span className="mr-2">📖</span>
            Descrição
          </h5>
          <p className="text-totoro-gray leading-relaxed text-justify">{ingredient.descricao}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-totoro-gray/10 rounded-lg p-4">
            <h6 className="font-medium text-totoro-gray mb-2">🆔 ID do Ingrediente</h6>
            <p className="text-totoro-gray/70 font-mono text-sm">{ingredient.id}</p>
          </div>
          <div className="bg-totoro-gray/10 rounded-lg p-4">
            <h6 className="font-medium text-totoro-gray mb-2">📊 Total de Pontos</h6>
            <p className="text-totoro-gray font-bold text-lg">
              {ingredient.combat + ingredient.utility + ingredient.whimsy}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-totoro-gray/20">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-totoro-green text-white rounded-lg hover:bg-totoro-green/90 transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
}
