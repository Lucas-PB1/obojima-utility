import React from 'react';
import { Ingredient } from '@/types/ingredients';
import Modal from './ui/Modal';

interface IngredientModalProps {
  ingredient: Ingredient | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function IngredientModal({ ingredient, isOpen, onClose }: IngredientModalProps) {
  if (!ingredient) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`🌿 ${ingredient.nome_portugues}`}
      size="lg"
    >
      <div className="space-y-6">
        <div className="text-center">
          <h4 className="text-lg font-medium text-gray-700 mb-2">
            {ingredient.nome_ingles}
          </h4>
          <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-red-600 text-sm font-medium mb-1">⚔️ Combat</div>
            <div className="text-2xl font-bold text-red-800">{ingredient.combat}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-blue-600 text-sm font-medium mb-1">🛠️ Utility</div>
            <div className="text-2xl font-bold text-blue-800">{ingredient.utility}</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-purple-600 text-sm font-medium mb-1">✨ Whimsy</div>
            <div className="text-2xl font-bold text-purple-800">{ingredient.whimsy}</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200">
          <h5 className="font-semibold text-emerald-800 mb-3 flex items-center">
            <span className="mr-2">📖</span>
            Descrição
          </h5>
          <p className="text-gray-700 leading-relaxed text-justify">
            {ingredient.descricao}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h6 className="font-medium text-gray-800 mb-2">🆔 ID do Ingrediente</h6>
            <p className="text-gray-600 font-mono text-sm">{ingredient.id}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h6 className="font-medium text-gray-800 mb-2">📊 Total de Pontos</h6>
            <p className="text-gray-600 font-bold text-lg">
              {ingredient.combat + ingredient.utility + ingredient.whimsy}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
}
