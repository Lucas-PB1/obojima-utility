import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { POTION_CATEGORY_CONFIG } from '@/constants/potions';
import { PotionScores } from '@/types/ingredients';

interface ScorePreviewProps {
  previewScores: PotionScores;
  availableScores: { canChoose: boolean } | null;
  chosenAttribute: 'combat' | 'utility' | 'whimsy' | null;
}

export function ScorePreview({ previewScores, availableScores, chosenAttribute }: ScorePreviewProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-muted/30 p-4 rounded-lg border border-border/20">
      <h4 className="text-sm font-medium text-foreground mb-3">
        {t('potions.create.preview')}
      </h4>
      <div className="grid grid-cols-3 gap-4">
        {(['combat', 'utility', 'whimsy'] as const).map((attr) => (
          <div
            key={attr}
            className={`p-3 rounded-lg border ${POTION_CATEGORY_CONFIG[attr].classes} ${previewScores.winningAttribute === attr ? 'ring-2 ring-opacity-50 ring-current' : ''}`}
          >
            <div className="text-xs font-medium">
              {t(POTION_CATEGORY_CONFIG[attr].label)}
            </div>
            <div className="text-lg font-bold">
              {attr === 'combat'
                ? previewScores.combatScore
                : attr === 'utility'
                  ? previewScores.utilityScore
                  : previewScores.whimsyScore}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-sm text-foreground/60">
        {t('potions.create.winningCategory')}{' '}
        <span className="font-medium text-foreground">
          {t(POTION_CATEGORY_CONFIG[previewScores.winningAttribute].label)}
        </span>
      </div>

      {availableScores?.canChoose && (
        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center text-purple-700 text-sm">
            <span className="mr-2">🧪</span>
            <span className="font-medium">{t('potions.create.brewerActive')}</span>
          </div>
          <p className="text-xs text-purple-600 mt-1">{t('potions.create.brewerDesc')}</p>
          {chosenAttribute && (
            <p className="text-xs text-purple-800 mt-1 font-medium">
              {t('potions.create.chosen')}{' '}
              {t(POTION_CATEGORY_CONFIG[chosenAttribute].label)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
