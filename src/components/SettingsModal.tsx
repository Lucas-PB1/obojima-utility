import React from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import { useSettings } from '@/hooks/useSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: () => void;
}

export default function SettingsModal({ isOpen, onClose, onSettingsChange }: SettingsModalProps) {
  const { settings, isLoading, saveSettings, clearSettings, updateSetting } = useSettings();

  const handleSave = async () => {
    try {
      await saveSettings(settings);
      onSettingsChange();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const handleClear = async () => {
    try {
      await clearSettings();
      onSettingsChange();
    } catch (error) {
      console.error('Erro ao limpar configurações:', error);
    }
  };

  const diceOptions = [
    { value: 'd4', label: 'D4' },
    { value: 'd6', label: 'D6' },
    { value: 'd8', label: 'D8' },
    { value: 'd10', label: 'D10' },
    { value: 'd12', label: 'D12' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚙️ Configurações Padrão"
      size="md"
    >
      <div className="space-y-6">

        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">🎯</span>
            Modificador Padrão
          </h4>
          <Input
            type="number"
            value={settings.defaultModifier}
            onChange={(value) => updateSetting('defaultModifier', value as number | '')}
            placeholder="Ex: 5"
            label="Valor do modificador que será usado por padrão"
          />
          <p className="text-sm text-gray-500 mt-2">
            Deixe vazio para não usar modificador padrão
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">🎲</span>
            Dado Bônus Padrão
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={settings.defaultBonusType}
              onChange={(value) => updateSetting('defaultBonusType', value)}
              options={diceOptions}
              placeholder="Selecione o dado"
              label="Tipo do Dado"
            />
            
            <Input
              type="number"
              value={settings.defaultBonusValue}
              onChange={(value) => updateSetting('defaultBonusValue', value as number)}
              placeholder="Ex: 2"
              label="Quantidade"
              min={1}
              max={10}
            />
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            Configure um dado bônus que será usado automaticamente
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-800 mb-2">💡 Como Funciona</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Os valores padrão serão aplicados automaticamente ao abrir a página</li>
            <li>• Você ainda pode alterar os valores individualmente</li>
            <li>• As configurações são salvas no seu navegador</li>
          </ul>
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Button
            onClick={handleClear}
            variant="danger"
          >
            🗑️ Limpar Configurações
          </Button>
          
          <div className="space-x-3">
            <Button
              onClick={onClose}
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : '💾 Salvar'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
