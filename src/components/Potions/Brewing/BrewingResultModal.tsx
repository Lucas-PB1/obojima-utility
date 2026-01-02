import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Modal, Button } from '@/components/ui';
import { PotionBrewingResult } from '@/types/ingredients';
import { POTION_CATEGORY_CONFIG } from '@/constants/potions';

interface BrewingResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PotionBrewingResult | null;
}

export function BrewingResultModal({ isOpen, onClose, result }: BrewingResultModalProps) {
  const { t } = useTranslation();

  if (!result) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={result.success ? t('potions.result.success.title') : t('potions.result.failure.title')}
    >
      <div className="space-y-4">
        {result.success ? (
          <>
            <div className="text-center">
              <span className="font-bold text-lg">{result.recipe.resultingPotion.nome}</span>

              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  result.recipe.resultingPotion.raridade === 'Comum'
                    ? 'bg-green-100 text-green-800'
                    : result.recipe.resultingPotion.raridade === 'Incomum'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                }`}
              >
                {result.recipe.resultingPotion.raridade}
              </div>
            </div>

            {result.cauldronBonus && result.remainsPotion && (
              <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-lg mb-2">✨</div>
                  <h4 className="font-bold text-green-800 text-lg mb-2">
                    {t('potions.result.remains.title')}
                  </h4>
                  <p className="text-green-700 text-sm mb-3">{t('potions.result.remains.desc')}</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 border border-green-200/20">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-700 dark:text-green-400 mb-1">
                      {result.remainsPotion.nome}
                    </div>
                    <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-3">
                      {result.remainsPotion.raridade}
                    </div>
                    <p className="text-xs text-gray-700">{result.remainsPotion.descricao}</p>
                  </div>
                </div>
              </div>
            )}

            {result.potionBrewerSuccess && result.secondPotion && (
              <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-lg mb-2">🧪</div>
                  <h4 className="font-bold text-purple-800 text-lg mb-2">
                    {t('potions.result.second.title')}
                  </h4>
                  <p className="text-purple-700 text-sm mb-3">
                    {t('potions.result.second.desc', result.percentageRoll ?? 0)}
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 border border-purple-200/20">
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-1">
                      {result.secondPotion.nome}
                    </div>
                    <div
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${
                        result.secondPotion.raridade === 'Comum'
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                          : result.secondPotion.raridade === 'Incomum'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {result.secondPotion.raridade}
                    </div>
                    <p className="text-xs text-gray-700">{result.secondPotion.descricao}</p>
                  </div>
                </div>
              </div>
            )}

            {result.potionBrewerSuccess === false && (
              <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-lg mb-2">🧪</div>
                  <h4 className="font-bold text-gray-700 text-lg mb-2">
                    {t('potions.result.brewer.failure.title')}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {t('potions.result.brewer.failure.desc', result.percentageRoll ?? 0)}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{t('ui.labels.description')}:</h4>
              <p className="text-sm text-gray-700">{result.recipe.resultingPotion.descricao}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{t('potions.result.scores')}</h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                {(['combat', 'utility', 'whimsy'] as const).map((attr) => (
                  <div key={attr} className="text-center">
                    <div
                      className={`font-medium ${POTION_CATEGORY_CONFIG[attr].classes.split(' ')[0]}`}
                    >
                      {t(POTION_CATEGORY_CONFIG[attr].label)}
                    </div>
                    <div className="text-lg font-bold">
                      {attr === 'combat'
                        ? result.recipe.combatScore
                        : attr === 'utility'
                          ? result.recipe.utilityScore
                          : result.recipe.whimsyScore}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-red-600">
            <div className="text-lg font-medium mb-2">{t('potions.result.error')}</div>
            <p className="text-sm">{result.message}</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={onClose}>{t('ui.actions.close')}</Button>
        </div>
      </div>
    </Modal>
  );
}
