import React from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useSettings } from '@/hooks/useSettings';
import { DICE_OPTIONS } from '@/constants/settings';
import { ThemeSwitch } from '@/components/ui/ThemeSwitch';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, isLoading, handleSave, handleClear, updateSetting } = useSettings();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚙️ Configurações do Sistema" size="md">
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Aparência do Sistema</h3>
            <p className="text-xs text-foreground/50">Escolha entre o tema claro e escuro</p>
          </div>
          <ThemeSwitch />
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center">
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
          <p className="text-sm text-foreground/60 mt-2">
            Deixe vazio para não usar modificador padrão
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center">
            <span className="mr-2">🎲</span>
            Dado Bônus Padrão
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <Select
              value={settings.defaultBonusType}
              onChange={(value) => updateSetting('defaultBonusType', value)}
              options={DICE_OPTIONS as unknown as { value: string; label: string }[]}
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

          <p className="text-sm text-foreground/60 mt-2">
            Configure um dado bônus que será usado automaticamente
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center">
            <span className="mr-2">✨</span>
            Talentos Especiais
          </h4>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-lg">
              <div className="flex-1">
                <h5 className="font-medium text-foreground mb-1">Forrageamento Duplo</h5>
                <p className="text-sm text-foreground/70">
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
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-lg">
              <div className="flex-1">
                <h5 className="font-medium text-foreground mb-1">Caldeirão Especial</h5>
                <p className="text-sm text-foreground/70">
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
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="p-4 bg-muted/30 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h5 className="font-medium text-foreground mb-1">Potion Brewer</h5>
                  <p className="text-sm text-foreground/70">
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
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
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
                  <p className="text-xs text-foreground/60 mt-1">
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

        <div className="flex justify-between pt-4 border-t border-border">
          <Button onClick={handleClear} variant="danger" effect="shimmer">
            🗑️ Limpar Configurações
          </Button>

          <div className="space-x-3">
            <Button onClick={onClose} variant="secondary" effect="ripple">
              Cancelar
            </Button>
            <Button
              onClick={() => handleSave(onClose)}
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
