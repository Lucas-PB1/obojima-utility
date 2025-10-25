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

/**
 * Modal para configurações do sistema
 * 
 * @description
 * Este modal permite configurar valores padrão para forrageamento,
 * talentos especiais e outras configurações do sistema.
 * 
 * @param isOpen - Estado de abertura do modal
 * @param onClose - Função para fechar o modal
 * @param onSettingsChange - Callback executado quando configurações mudam
 */
export default function SettingsModal({ isOpen, onClose, onSettingsChange }: SettingsModalProps) {
  const { settings, isLoading, saveSettings, clearSettings, updateSetting } = useSettings();

  /**
   * Salva as configurações atuais
   */
  const handleSave = async () => {
    try {
      await saveSettings(settings);
      onSettingsChange();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  /**
   * Limpa todas as configurações
   */
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
          <h4 className="font-semibold text-totoro-gray mb-3 flex items-center">
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
          <p className="text-sm text-totoro-gray/60 mt-2">
            Deixe vazio para não usar modificador padrão
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-totoro-gray mb-3 flex items-center">
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
          
          <p className="text-sm text-totoro-gray/60 mt-2">
            Configure um dado bônus que será usado automaticamente
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-totoro-gray mb-3 flex items-center">
            <span className="mr-2">✨</span>
            Talentos Especiais
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
              <div className="flex-1">
                <h5 className="font-medium text-purple-800 mb-1">Forrageamento Duplo</h5>
                <p className="text-sm text-purple-600">
                  Quando ativo, você coleta o dobro de ingredientes comuns e incomuns
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.doubleForageTalent || false}
                  onChange={(e) => updateSetting('doubleForageTalent', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <div className="flex-1">
                <h5 className="font-medium text-green-800 mb-1">Caldeirão Especial</h5>
                <p className="text-sm text-green-600">
                  Ao criar poções incomuns ou raras, você também gera uma poção comum do mesmo tipo
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cauldronBonus || false}
                  onChange={(e) => updateSetting('cauldronBonus', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h5 className="font-medium text-purple-800 mb-1">Potion Brewer</h5>
                  <p className="text-sm text-purple-600">
                    Permite escolher o segundo maior modificador e tem chance de gerar duas poções
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.potionBrewerTalent || false}
                    onChange={(e) => updateSetting('potionBrewerTalent', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              {settings.potionBrewerTalent && (
                <div className="mt-3">
                  <Input
                    type="number"
                    value={settings.potionBrewerLevel || 1}
                    onChange={(value) => updateSetting('potionBrewerLevel', value as number)}
                    placeholder="Ex: 5"
                    label="Level do Potion Brewer (1-20)"
                    min={1}
                    max={20}
                  />
                  <p className="text-xs text-purple-600 mt-1">
                    Chance de {settings.potionBrewerLevel || 1}% de gerar uma segunda poção
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-totoro-blue/10 border border-totoro-blue/20 rounded-lg p-4">
          <h5 className="font-medium text-totoro-blue mb-2">💡 Como Funciona</h5>
          <ul className="text-sm text-totoro-blue space-y-1">
            <li>• Os valores padrão serão aplicados automaticamente ao abrir a página</li>
            <li>• Você ainda pode alterar os valores individualmente</li>
            <li>• As configurações são salvas no seu navegador</li>
          </ul>
        </div>

        <div className="flex justify-between pt-4 border-t border-totoro-gray/20">
          <Button
            onClick={handleClear}
            variant="danger"
            effect="shimmer"
          >
            🗑️ Limpar Configurações
          </Button>
          
          <div className="space-x-3">
            <Button
              onClick={onClose}
              variant="secondary"
              effect="ripple"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              effect="pulse-glow"
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
