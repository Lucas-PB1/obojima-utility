'use client';
import { useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  Coins,
  Dices,
  Globe,
  Leaf,
  MapPinned,
  SlidersHorizontal,
  Sparkles,
  Target
} from 'lucide-react';
import { ingredientsService } from '@/services/ingredientsService';
import { useProtectedApp } from '@/hooks/useProtectedApp';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/hooks/useTranslation';
import { DICE_OPTIONS } from '@/constants/settings';
import { TEST_TYPE_OPTIONS } from '@/constants/forage';
import { AppLoadingScreen } from '@/components/AppShell/AppLoadingScreen';
import { SettingsHubLayout } from './SettingsHubLayout';
import { Button, ContentCard, Input, PageHeader, Select } from '@/components/ui';

function SaveStatusBadge({
  status,
  label
}: {
  status: 'idle' | 'saving' | 'saved' | 'error';
  label: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] shadow-[inset_0_0_0_1px_var(--hairline)] ${
        status === 'saved'
          ? 'bg-totoro-green/10 text-totoro-green'
          : status === 'error'
            ? 'bg-totoro-orange/10 text-totoro-orange'
            : status === 'saving'
              ? 'bg-totoro-blue/10 text-totoro-blue'
              : 'bg-muted/30 text-foreground/60'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          status === 'saved'
            ? 'bg-totoro-green'
            : status === 'error'
              ? 'bg-totoro-orange'
              : status === 'saving'
                ? 'bg-totoro-blue animate-pulse'
                : 'bg-foreground/30'
        }`}
      />
      {label}
    </div>
  );
}

function SettingsSectionHeader({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-lg bg-totoro-blue/10 p-2 text-totoro-blue shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.14)]">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-foreground/80">
          {title}
        </h3>
        <p className="mt-1 text-sm text-foreground/55">{description}</p>
      </div>
    </div>
  );
}

interface TalentToggleCardProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  accent: 'blue' | 'green' | 'orange';
  children?: React.ReactNode;
}

function TalentToggleCard({
  title,
  description,
  checked,
  onChange,
  accent,
  children
}: TalentToggleCardProps) {
  const accentClasses = {
    blue: 'peer-focus:ring-blue-300 bg-totoro-blue',
    green: 'peer-focus:ring-green-300 bg-totoro-green',
    orange: 'peer-focus:ring-orange-300 bg-totoro-orange'
  };

  return (
    <div className="rounded-lg bg-muted/30 p-4 shadow-[inset_0_0_0_1px_var(--hairline)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-medium text-foreground mb-1">{title}</h3>
          <p className="text-sm text-foreground/70">{description}</p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            className="sr-only peer"
          />
          <div
            className={`w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${accentClasses[accent]}`}
          ></div>
        </label>
      </div>

      {children}
    </div>
  );
}

export function PlayerSettingsPage() {
  const { t } = useTranslation();
  const { user, userProfile, logout, isInitialized, isReady } = useProtectedApp();
  const { settings, updateSetting, clearPlayerSettings, saveStatus, flushPendingSave } =
    useSettings();

  useEffect(() => {
    return () => {
      void flushPendingSave();
    };
  }, [flushPendingSave]);

  const translatedDiceOptions = DICE_OPTIONS.map((option) => ({
    ...option,
    label: option.label
  }));

  const saveStatusLabel =
    saveStatus === 'saving'
      ? t('settings.player.autosave.saving')
      : saveStatus === 'saved'
        ? t('settings.player.autosave.saved')
        : saveStatus === 'error'
          ? t('settings.player.autosave.error')
          : t('settings.player.autosave.idle');

  if (!isReady) {
    return <AppLoadingScreen isInitialized={isInitialized} />;
  }

  const handleResetPlayerSettings = async () => {
    const result = await Swal.fire({
      title: t('settings.player.reset.title'),
      text: t('settings.player.reset.description'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: t('settings.player.reset.confirm'),
      cancelButtonText: t('common.cancel'),
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    await clearPlayerSettings();
  };

  return (
    <SettingsHubLayout section="player" user={user} userProfile={userProfile} onLogout={logout}>
      <PageHeader
        title={t('settings.player.title')}
        subtitle={t('settings.player.subtitle')}
        icon={<SlidersHorizontal className="h-7 w-7" />}
        action={<SaveStatusBadge status={saveStatus} label={saveStatusLabel} />}
      />

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <ContentCard title={t('settings.player.defaults.title')}>
            <div className="space-y-8">
              <section className="space-y-4">
                <SettingsSectionHeader
                  icon={<Coins className="h-4 w-4" />}
                  title="Bolsa de gold"
                  description="Cadastre o gold disponível para pagar a criação de poções."
                />

                <Input
                  type="number"
                  value={settings.gold}
                  onChange={(value) => updateSetting('gold', Math.max(0, Number(value) || 0))}
                  onBlur={() => void flushPendingSave()}
                  min={0}
                  label="Gold atual"
                />
              </section>

              <section className="space-y-4">
                <SettingsSectionHeader
                  icon={<MapPinned className="h-4 w-4" />}
                  title={t('settings.player.defaults.forage.title')}
                  description={t('settings.player.defaults.forage.description')}
                />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_140px]">
                  <Select
                    value={settings.defaultRegion || ''}
                    onChange={(value) => updateSetting('defaultRegion', value)}
                    options={[
                      { value: '', label: t('common.none_female') },
                      ...ingredientsService.getRegionKeys().map((key) => ({
                        value: key,
                        label: ingredientsService.getRegionDisplayName(key, settings.language)
                      }))
                    ]}
                    placeholder={t('forage.form.region')}
                    label={t('forage.form.region')}
                  />

                  <Select
                    value={settings.defaultTestType || ''}
                    onChange={(value) =>
                      updateSetting(
                        'defaultTestType',
                        value ? (value as 'natureza' | 'sobrevivencia') : undefined
                      )
                    }
                    options={[
                      { value: '', label: t('common.none') },
                      ...TEST_TYPE_OPTIONS.map((option) => ({
                        ...option,
                        label: t(option.label)
                      }))
                    ]}
                    placeholder={t('forage.form.testType')}
                    label={t('forage.form.testType')}
                  />

                  <Input
                    type="number"
                    value={settings.defaultModifier}
                    onChange={(value) => updateSetting('defaultModifier', value as number | '')}
                    onBlur={() => void flushPendingSave()}
                    placeholder={t('settings.modifier.placeholder')}
                    label={t('settings.player.defaults.modifier.label')}
                  />
                </div>
              </section>

              <section className="space-y-4 border-t border-[color:var(--hairline)] pt-6">
                <SettingsSectionHeader
                  icon={<Dices className="h-4 w-4" />}
                  title={t('settings.player.defaults.bonus.title')}
                  description={t('settings.player.defaults.bonus.description')}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_140px]">
                  <Select
                    value={settings.defaultBonusType}
                    onChange={(value) => updateSetting('defaultBonusType', value)}
                    options={[
                      { value: '', label: t('forage.form.bonusDice.none') },
                      ...translatedDiceOptions
                    ]}
                    placeholder={t('settings.bonus.select.placeholder')}
                    label={t('settings.bonus.select.label')}
                  />

                  <Input
                    type="number"
                    value={settings.defaultBonusValue}
                    onChange={(value) => updateSetting('defaultBonusValue', value as number)}
                    onBlur={() => void flushPendingSave()}
                    min={1}
                    max={10}
                    label={t('settings.bonus.amount.label')}
                  />
                </div>
              </section>
            </div>
          </ContentCard>

          <ContentCard title={t('settings.player.talents.section')}>
            <div className="space-y-4">
              <TalentToggleCard
                title={t('settings.talents.doubleForage.title')}
                description={t('settings.talents.doubleForage.desc')}
                checked={settings.doubleForageTalent || false}
                onChange={(value) => updateSetting('doubleForageTalent', value)}
                accent="green"
              />

              <TalentToggleCard
                title={t('settings.talents.cauldron.title')}
                description={t('settings.talents.cauldron.desc')}
                checked={settings.cauldronBonus || false}
                onChange={(value) => updateSetting('cauldronBonus', value)}
                accent="orange"
              />

              <TalentToggleCard
                title={t('settings.talents.potionBrewer.title')}
                description={t('settings.talents.potionBrewer.desc')}
                checked={settings.potionBrewerTalent || false}
                onChange={(value) => updateSetting('potionBrewerTalent', value)}
                accent="blue"
              >
                {settings.potionBrewerTalent && (
                  <div className="mt-4 border-t border-white/40 pt-4">
                    <Input
                      type="number"
                      value={settings.potionBrewerLevel || 1}
                      onChange={(value) => updateSetting('potionBrewerLevel', value as number)}
                      onBlur={() => void flushPendingSave()}
                      placeholder={t('settings.talents.potionBrewer.level.placeholder')}
                      label={t('settings.talents.potionBrewer.level.label')}
                      min={1}
                      max={20}
                    />
                    <p className="mt-2 text-xs text-foreground/60">
                      {t(
                        'settings.talents.potionBrewer.level.desc',
                        settings.potionBrewerLevel || 1
                      )}
                    </p>
                  </div>
                )}
              </TalentToggleCard>
            </div>
          </ContentCard>
        </div>

        <div className="space-y-6">
          <ContentCard title={t('settings.player.summary.title')}>
            <div className="space-y-4">
              <div className="rounded-lg bg-totoro-blue/10 p-4 shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.16)]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-white/60 p-2 text-totoro-blue shadow-[var(--shadow-soft)]">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-totoro-blue">
                      {t('settings.player.summary.defaults')}
                    </h3>
                    <p className="mt-1 text-sm text-totoro-blue/80">
                      {t('settings.player.summary.defaultsDesc')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-totoro-green/10 p-4 shadow-[inset_0_0_0_1px_rgba(var(--success-rgb),0.16)]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-white/60 p-2 text-totoro-green shadow-[var(--shadow-soft)]">
                    <Leaf className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-totoro-green">
                      {t('settings.player.summary.forage')}
                    </h3>
                    <p className="mt-1 text-sm text-totoro-green/80">
                      {t('settings.player.summary.forageDesc')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-totoro-orange/10 p-4 shadow-[inset_0_0_0_1px_rgba(var(--danger-rgb),0.16)]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-white/60 p-2 text-totoro-orange shadow-[var(--shadow-soft)]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-totoro-orange">
                      {t('settings.player.summary.potions')}
                    </h3>
                    <p className="mt-1 text-sm text-totoro-orange/80">
                      {t('settings.player.summary.potionsDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ContentCard>

          <ContentCard title={t('settings.player.system.title')}>
            <div className="space-y-5">
              <div className="rounded-lg bg-muted/30 p-4 shadow-[inset_0_0_0_1px_var(--hairline)]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-white/60 p-2 text-totoro-blue shadow-[var(--shadow-soft)]">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {t('settings.player.system.accountPrefsTitle')}
                    </h3>
                    <p className="mt-1 text-sm text-foreground/60">
                      {t('settings.player.system.accountPrefsDesc')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-totoro-blue/10 p-4 shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.16)]">
                <h3 className="text-sm font-semibold text-totoro-blue">
                  {t('settings.player.reset.cardTitle')}
                </h3>
                <p className="mt-2 text-sm text-totoro-blue/80">
                  {t('settings.player.reset.cardDescription')}
                </p>

                <div className="mt-4">
                  <Button
                    variant="ghost"
                    onClick={handleResetPlayerSettings}
                    className="w-full sm:w-auto !text-totoro-orange hover:!bg-totoro-orange/10"
                  >
                    {t('settings.player.reset.button')}
                  </Button>
                </div>
              </div>
            </div>
          </ContentCard>
        </div>
      </div>
    </SettingsHubLayout>
  );
}
