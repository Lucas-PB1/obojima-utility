import React from 'react';
import { Input, Button, Select, RadioGroup, ContentCard } from '@/components/ui';
import { ingredientsService } from '@/services/ingredientsService';
import { RegionKey, TestType, DiceType, AdvantageType } from '@/types/ingredients';
import { DICE_OPTIONS, TEST_TYPE_OPTIONS, ADVANTAGE_OPTIONS } from '@/constants/forage';

interface ForageFormProps {
  region: RegionKey;
  setRegion: (region: RegionKey) => void;
  testType: TestType;
  setTestType: (type: TestType) => void;
  modifier: number | '';
  setModifier: (modifier: number | '') => void;
  bonusDice: { type: DiceType; value: number } | null;
  setBonusDice: (dice: { type: DiceType; value: number } | null) => void;
  advantage: AdvantageType;
  setAdvantage: (advantage: AdvantageType) => void;
  onForage: () => void;
  isLoading: boolean;
  remainingAttempts: number;
}

import { useTranslation } from '@/hooks/useTranslation';
import { useSettings } from '@/hooks/useSettings';

export function ForageForm({
  region,
  setRegion,
  testType,
  setTestType,
  modifier,
  setModifier,
  bonusDice,
  setBonusDice,
  advantage,
  setAdvantage,
  onForage,
  isLoading,
  remainingAttempts
}: ForageFormProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const regionOptions = ingredientsService.getRegionKeys().map((key) => ({
    value: key,
    label: ingredientsService.getRegionDisplayName(key, settings.language)
  }));

  const translatedTestTypeOptions = TEST_TYPE_OPTIONS.map((opt) => ({
    ...opt,
    label: t(opt.label)
  }));

  const translatedAdvantageOptions = ADVANTAGE_OPTIONS.map((opt) => ({
    ...opt,
    label: t(opt.label)
  }));

  const translatedDiceOptions = DICE_OPTIONS.map((opt) => ({
    ...opt,
    label: opt.label
  }));

  return (
    <ContentCard title={t('forage.form.title')}>
      <div className="space-y-6">
        <Select
          value={region}
          onChange={(value) => setRegion(value as RegionKey)}
          options={regionOptions}
          label={t('forage.form.region')}
        />

        <RadioGroup
          value={testType}
          onChange={(value) => setTestType(value as TestType)}
          options={translatedTestTypeOptions}
          label={t('forage.form.testType')}
        />

        <Input
          type="number"
          value={modifier}
          onChange={(value) => setModifier(value === '' ? '' : Number(value))}
          label={t('forage.form.modifier')}
          placeholder={t('forage.form.modifier.placeholder')}
        />

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            {t('forage.form.bonusDice')}
          </label>
          <div className="flex space-x-2">
            <Select
              value={bonusDice?.type || ''}
              onChange={(type) => {
                if (type) {
                  setBonusDice({ type: type as DiceType, value: 1 });
                } else {
                  setBonusDice(null);
                }
              }}
              options={[
                { value: '', label: t('forage.form.bonusDice.none') },
                ...translatedDiceOptions
              ]}
              className="flex-1"
            />
            {bonusDice && (
              <Input
                type="number"
                value={bonusDice.value}
                onChange={(value) => setBonusDice({ ...bonusDice, value: value as number })}
                min={1}
                max={10}
                className="w-20"
              />
            )}
          </div>
        </div>

        <RadioGroup
          value={advantage}
          onChange={(value) => setAdvantage(value as AdvantageType)}
          options={translatedAdvantageOptions}
          label={t('forage.form.advantage')}
        />

        <Button
          onClick={onForage}
          disabled={isLoading || remainingAttempts <= 0}
          fullWidth
          size="lg"
          effect="pulse-glow"
          variant="danger"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
              {t('forage.form.button.loading')}
            </span>
          ) : remainingAttempts <= 0 ? (
            t('forage.form.button.limit')
          ) : (
            t('forage.form.button.forage')
          )}
        </Button>
      </div>
    </ContentCard>
  );
}
