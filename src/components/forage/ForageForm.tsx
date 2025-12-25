import React from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import RadioGroup from '@/components/ui/RadioGroup';
import ContentCard from '@/components/ui/ContentCard';
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

export default function ForageForm({
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
  const regionOptions = ingredientsService.getRegionKeys().map((key) => ({
    value: key,
    label: ingredientsService.getRegionDisplayName(key)
  }));

  return (
    <ContentCard title="⚙️ Configuração do Teste">
      <div className="space-y-6">
        <Select
          value={region}
          onChange={(value) => setRegion(value as RegionKey)}
          options={regionOptions}
          label="🌍 Região"
        />

        <RadioGroup
          value={testType}
          onChange={(value) => setTestType(value as TestType)}
          options={TEST_TYPE_OPTIONS}
          label="🎯 Tipo de Teste"
        />

        <Input
          type="number"
          value={modifier}
          onChange={(value) => setModifier(value === '' ? '' : Number(value))}
          label="➕ Modificador do Teste"
          placeholder="Ex: +3"
        />

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            🎲 Dados de Bônus
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
              options={[{ value: '', label: 'Nenhum' }, ...DICE_OPTIONS]}
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
          options={ADVANTAGE_OPTIONS}
          label="🎯 Vantagem/Desvantagem"
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
              Forrageando...
            </span>
          ) : remainingAttempts <= 0 ? (
            '🚫 Limite diário atingido'
          ) : (
            '🌿 Tentar Forragear'
          )}
        </Button>
      </div>
    </ContentCard>
  );
}
