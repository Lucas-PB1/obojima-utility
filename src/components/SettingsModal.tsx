import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import { settingsService } from '@/services/settingsService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: () => void;
}

export default function SettingsModal({ isOpen, onClose, onSettingsChange }: SettingsModalProps) {
  const [defaultModifier, setDefaultModifier] = useState<number | ''>('');
  const [defaultBonusType, setDefaultBonusType] = useState<string>('');
  const [defaultBonusValue, setDefaultBonusValue] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      // Carregar configurações atuais
      setDefaultModifier(settingsService.getDefaultModifier());
      
      const bonusDice = settingsService.getDefaultBonusDice();
      if (bonusDice) {
        setDefaultBonusType(bonusDice.type);
        setDefaultBonusValue(bonusDice.value);
      } else {
        setDefaultBonusType('');
        setDefaultBonusValue(0);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    // Salvar modificador padrão
    settingsService.setDefaultModifier(defaultModifier);
    
    // Salvar dado bônus padrão
    if (defaultBonusType && defaultBonusValue > 0) {
      settingsService.setDefaultBonusDice({
        type: defaultBonusType,
        value: defaultBonusValue
      });
    } else {
      settingsService.setDefaultBonusDice(null);
    }
    
    onSettingsChange();
    onClose();
  };

  const handleClear = () => {
    setDefaultModifier('');
    setDefaultBonusType('');
    setDefaultBonusValue(0);
    settingsService.clearSettings();
    onSettingsChange();
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

        {/* Modificador Padrão */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">🎯</span>
            Modificador Padrão
          </h4>
          <Input
            type="number"
            value={defaultModifier}
            onChange={(value) => setDefaultModifier(value as number | '')}
            placeholder="Ex: 5"
            label="Valor do modificador que será usado por padrão"
          />
          <p className="text-sm text-gray-500 mt-2">
            Deixe vazio para não usar modificador padrão
          </p>
        </div>

        {/* Dado Bônus Padrão */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">🎲</span>
            Dado Bônus Padrão
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={defaultBonusType}
              onChange={setDefaultBonusType}
              options={diceOptions}
              placeholder="Selecione o dado"
              label="Tipo do Dado"
            />
            
            <Input
              type="number"
              value={defaultBonusValue}
              onChange={(value) => setDefaultBonusValue(value as number)}
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

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-800 mb-2">💡 Como Funciona</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Os valores padrão serão aplicados automaticamente ao abrir a página</li>
            <li>• Você ainda pode alterar os valores individualmente</li>
            <li>• As configurações são salvas no seu navegador</li>
          </ul>
        </div>

        {/* Botões */}
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
            >
              💾 Salvar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
