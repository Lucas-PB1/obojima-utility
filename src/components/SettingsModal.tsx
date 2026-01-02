import React from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useSettings } from '@/hooks/useSettings';
import { DICE_OPTIONS, LANGUAGE_OPTIONS, Language } from '@/constants/settings';
import { ThemeSwitch } from '@/components/ui/ThemeSwitch';
import { useTranslation } from '@/hooks/useTranslation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, clearSettings, updateSetting } = useSettings();
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')} size="md">
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('settings.appearance.title')}
            </h3>
            <p className="text-xs text-foreground/50">{t('settings.appearance.desc')}</p>
          </div>
          <ThemeSwitch />
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center">
            <span className="mr-2">🌍</span>
            {t('settings.language.title')}
          </h4>
          <Select
            value={settings.language}
            onChange={(value) => updateSetting('language', value as Language)}
            options={[...LANGUAGE_OPTIONS]}
            placeholder={t('settings.language.placeholder')}
            label={t('settings.language.label')}
          />
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center">
            <span className="mr-2">🎯</span>
            {t('settings.modifier.title')}
          </h4>
          <Input
            type="number"
            value={settings.defaultModifier}
            onChange={(value) => updateSetting('defaultModifier', value as number | '')}
            placeholder={t('settings.modifier.placeholder')}
            label={t('settings.modifier.label')}
          />
          <p className="text-sm text-foreground/60 mt-2">{t('settings.modifier.desc')}</p>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center">
            <span className="mr-2">🎲</span>
            {t('settings.bonus.title')}
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <Select
              value={settings.defaultBonusType}
              onChange={(value) => updateSetting('defaultBonusType', value)}
              options={[...DICE_OPTIONS]}
              placeholder={t('settings.bonus.select.placeholder')}
              label={t('settings.bonus.select.label')}
            />

            <Input
              type="number"
              value={settings.defaultBonusValue}
              onChange={(value) => updateSetting('defaultBonusValue', value as number)}
              placeholder={t('settings.bonus.amount.placeholder')}
              label={t('settings.bonus.amount.label')}
              min={1}
              max={10}
            />
          </div>

          <p className="text-sm text-foreground/60 mt-2">{t('settings.bonus.desc')}</p>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center">
            <span className="mr-2">✨</span>
            {t('settings.talents.title')}
          </h4>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-lg">
              <div className="flex-1">
                <h5 className="font-medium text-foreground mb-1">
                  {t('settings.talents.doubleForage.title')}
                </h5>
                <p className="text-sm text-foreground/70">
                  {t('settings.talents.doubleForage.desc')}
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
                <h5 className="font-medium text-foreground mb-1">
                  {t('settings.talents.cauldron.title')}
                </h5>
                <p className="text-sm text-foreground/70">{t('settings.talents.cauldron.desc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cauldronBonus || false}
                  onChange={(e) => updateSetting('cauldronBonus', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all bg-green-600"></div>
              </label>
            </div>

            <div className="p-4 bg-muted/30 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h5 className="font-medium text-foreground mb-1">
                    {t('settings.talents.potionBrewer.title')}
                  </h5>
                  <p className="text-sm text-foreground/70">
                    {t('settings.talents.potionBrewer.desc')}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.potionBrewerTalent || false}
                    onChange={(e) => updateSetting('potionBrewerTalent', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all bg-purple-600"></div>
                </label>
              </div>

              {settings.potionBrewerTalent && (
                <div className="mt-3">
                  <Input
                    type="number"
                    value={settings.potionBrewerLevel || 1}
                    onChange={(value) => updateSetting('potionBrewerLevel', value as number)}
                    placeholder={t('settings.talents.potionBrewer.level.placeholder')}
                    label={t('settings.talents.potionBrewer.level.label')}
                    min={1}
                    max={20}
                  />
                  <p className="text-xs text-foreground/60 mt-1">
                    {t('settings.talents.potionBrewer.level.desc', settings.potionBrewerLevel || 1)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-totoro-blue/10 border border-totoro-blue/20 rounded-lg p-4">
          <h5 className="font-medium text-totoro-blue mb-2">{t('settings.howItWorks.title')}</h5>
          <ul className="text-sm text-totoro-blue space-y-1">
            <li>{t('settings.howItWorks.item1')}</li>
            <li>{t('settings.howItWorks.item2')}</li>
            <li>{t('settings.howItWorks.item3')}</li>
          </ul>
        </div>

        <div className="flex justify-between pt-4 border-t border-border">
          <button
            onClick={clearSettings}
            className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            {t('ui.actions.clear')}
          </button>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              {t('ui.actions.close')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
