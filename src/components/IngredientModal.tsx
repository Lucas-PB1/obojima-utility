import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Ingredient } from '@/types/ingredients';
import { useTranslation } from '@/hooks/useTranslation';
import { ingredientsService } from '@/services/ingredientsService';

interface IngredientModalProps {
  ingredient: Ingredient | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function IngredientModal({ ingredient, isOpen, onClose }: IngredientModalProps) {
  const { t, language } = useTranslation();
  const [localizedIngredient, setLocalizedIngredient] = useState<Ingredient | null>(null);

  useEffect(() => {
    async function loadIngredient() {
      if (ingredient) {
        setLocalizedIngredient(ingredient);

        try {
          const freshData = await ingredientsService.getIngredientById(
            ingredient.id,
            language,
            ingredient.raridade
          );
          if (freshData) {
            setLocalizedIngredient(freshData);
          }
        } catch (error) {
          console.error('Error loading localized ingredient:', error);
        }
      } else {
        setLocalizedIngredient(null);
      }
    }

    if (isOpen) {
      loadIngredient();
    }
  }, [ingredient, isOpen, language]);

  if (!localizedIngredient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`🌿 ${localizedIngredient.nome}`} size="lg">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-1 bg-gradient-to-r from-totoro-green to-totoro-blue mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-totoro-orange/20 border border-totoro-orange/30 rounded-lg p-4 text-center">
            <div className="text-totoro-orange text-sm font-medium mb-1">⚔️ {t('forage.result.stats.combat')}</div>
            <div className="text-2xl font-bold text-totoro-orange">{localizedIngredient.combat}</div>
          </div>
          <div className="bg-totoro-blue/20 border border-totoro-blue/30 rounded-lg p-4 text-center">
            <div className="text-totoro-blue text-sm font-medium mb-1">🛠️ {t('forage.result.stats.utility')}</div>
            <div className="text-2xl font-bold text-totoro-blue">{localizedIngredient.utility}</div>
          </div>
          <div className="bg-totoro-yellow/20 border border-totoro-yellow/30 rounded-lg p-4 text-center">
            <div className="text-totoro-yellow text-sm font-medium mb-1">✨ {t('forage.result.stats.whimsy')}</div>
            <div className="text-2xl font-bold text-totoro-yellow">{localizedIngredient.whimsy}</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-totoro-green/10 to-totoro-blue/10 rounded-lg p-6 border border-totoro-green/20">
          <h5 className="font-semibold text-totoro-gray mb-3 flex items-center">
            <span className="mr-2">📖</span>
            {t('ingredients.modal.description')}
          </h5>
          <p className="text-totoro-gray leading-relaxed text-justify">{localizedIngredient.descricao}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-totoro-gray/10 rounded-lg p-4">
            <h6 className="font-medium text-totoro-gray mb-2">🆔 {t('ingredients.modal.id')}</h6>
            <p className="text-totoro-gray/70 font-mono text-sm">{localizedIngredient.id}</p>
          </div>
          <div className="bg-totoro-gray/10 rounded-lg p-4">
            <h6 className="font-medium text-totoro-gray mb-2">📊 {t('ingredients.modal.totalPoints')}</h6>
            <p className="text-totoro-gray font-bold text-lg">
              {localizedIngredient.combat + localizedIngredient.utility + localizedIngredient.whimsy}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-totoro-gray/20">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-totoro-green text-white rounded-lg hover:bg-totoro-green/90 transition-colors font-medium"
          >
            {t('ingredients.modal.close')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
