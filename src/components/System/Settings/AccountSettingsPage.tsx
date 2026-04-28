'use client';
import { useEffect, useMemo, useState } from 'react';
import { Globe, Palette, Shield, Sparkles, UserRound } from 'lucide-react';
import { authService } from '@/services/authService';
import { useProtectedApp } from '@/hooks/useProtectedApp';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/hooks/useTranslation';
import { LANGUAGE_OPTIONS } from '@/constants/settings';
import { AppLoadingScreen } from '@/components/AppShell/AppLoadingScreen';
import { SettingsHubLayout } from './SettingsHubLayout';
import { Button, ContentCard, Input, PageHeader, Select, ThemeSwitch, UserAvatar } from '@/components/ui';

type FeedbackState = {
  status: 'idle' | 'saving' | 'saved' | 'error';
  message: string | null;
};

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function AccountSettingsPage() {
  const { t } = useTranslation();
  const { user, userProfile, logout, isInitialized, isReady } = useProtectedApp();
  const { settings, updateSetting } = useSettings();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileFeedback, setProfileFeedback] = useState<FeedbackState>({
    status: 'idle',
    message: null
  });
  const [securityFeedback, setSecurityFeedback] = useState<FeedbackState>({
    status: 'idle',
    message: null
  });

  useEffect(() => {
    setDisplayName(userProfile?.displayName || user?.displayName || '');
    setPhotoURL(userProfile?.photoURL || user?.photoURL || '');
  }, [user?.displayName, user?.photoURL, userProfile?.displayName, userProfile?.photoURL]);

  const currentDisplayName = userProfile?.displayName || user?.displayName || '';
  const currentEmail = userProfile?.email || user?.email || '';
  const currentPhotoURL = userProfile?.photoURL || user?.photoURL || '';
  const trimmedDisplayName = displayName.trim();
  const trimmedPhotoURL = photoURL.trim();
  const photoUrlIsValid = !trimmedPhotoURL || isValidUrl(trimmedPhotoURL);
  const hasProfileChanges =
    trimmedDisplayName !== (currentDisplayName || '').trim() ||
    trimmedPhotoURL !== (currentPhotoURL || '').trim();

  const passwordValidationError = useMemo(() => {
    const hasAnyPasswordInput = currentPassword || newPassword || confirmPassword;
    if (!hasAnyPasswordInput) return null;
    if (!currentPassword) return t('settings.account.security.validation.currentRequired');
    if (!newPassword) return t('settings.account.security.validation.newRequired');
    if (newPassword.length < 6) return t('settings.account.security.validation.minLength');
    if (newPassword !== confirmPassword) {
      return t('settings.account.security.validation.mismatch');
    }
    return null;
  }, [confirmPassword, currentPassword, newPassword, t]);

  if (!isReady) {
    return <AppLoadingScreen isInitialized={isInitialized} />;
  }

  const resetProfileFeedback = () => {
    if (profileFeedback.status !== 'idle') {
      setProfileFeedback({ status: 'idle', message: null });
    }
  };

  const resetSecurityFeedback = () => {
    if (securityFeedback.status !== 'idle') {
      setSecurityFeedback({ status: 'idle', message: null });
    }
  };

  const handleProfileSave = async () => {
    if (!user) return;

    if (!trimmedDisplayName) {
      setProfileFeedback({
        status: 'error',
        message: t('settings.account.profile.validation.displayNameRequired')
      });
      return;
    }

    if (!photoUrlIsValid) {
      setProfileFeedback({
        status: 'error',
        message: t('settings.account.profile.validation.photoUrl')
      });
      return;
    }

    if (!hasProfileChanges) {
      setProfileFeedback({
        status: 'saved',
        message: t('settings.account.profile.feedback.noChanges')
      });
      return;
    }

    setProfileFeedback({ status: 'saving', message: null });

    try {
      await authService.updateProfile(trimmedDisplayName, trimmedPhotoURL || null);
      setProfileFeedback({
        status: 'saved',
        message: t('settings.account.profile.feedback.saved')
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('settings.account.profile.feedback.error');
      setProfileFeedback({ status: 'error', message });
    }
  };

  const handlePasswordSave = async () => {
    if (passwordValidationError) {
      setSecurityFeedback({
        status: 'error',
        message: passwordValidationError
      });
      return;
    }

    setSecurityFeedback({ status: 'saving', message: null });

    try {
      await authService.updatePasswordWithReauth(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSecurityFeedback({
        status: 'saved',
        message: t('settings.account.security.feedback.saved')
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('settings.account.security.feedback.error');
      setSecurityFeedback({ status: 'error', message });
    }
  };

  return (
    <SettingsHubLayout section="account" user={user} userProfile={userProfile} onLogout={logout}>
      <PageHeader
        title={t('settings.account.title')}
        subtitle={t('settings.account.subtitle')}
        icon={<UserRound className="h-7 w-7" />}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ContentCard title={t('settings.account.profile.title')}>
          <div className="space-y-6">
            <div className="rounded-lg bg-gradient-to-br from-totoro-blue/10 via-white/40 to-transparent p-5 shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.14),var(--shadow-soft)]">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <UserAvatar
                  src={photoUrlIsValid ? trimmedPhotoURL || currentPhotoURL : currentPhotoURL}
                  name={trimmedDisplayName || currentDisplayName}
                  email={currentEmail}
                  className="h-24 w-24 shrink-0"
                  fallbackClassName="text-2xl"
                  iconClassName="h-10 w-10"
                />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-totoro-blue/60">
                    {t('settings.account.profile.preview')}
                  </p>
                  <h2 className="text-2xl font-serif font-bold text-totoro-gray">
                    {trimmedDisplayName || currentDisplayName || t('admin.users.noName')}
                  </h2>
                  <p className="text-sm text-foreground/60">{currentEmail}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <Input
                label={t('settings.profile.displayName')}
                value={displayName}
                onChange={(value) => {
                  resetProfileFeedback();
                  setDisplayName(String(value));
                }}
                placeholder={t('settings.account.profile.displayNamePlaceholder')}
                autoComplete="nickname"
              />

              <Input
                type="email"
                label={t('settings.account.profile.email')}
                value={currentEmail}
                onChange={() => {}}
                readOnly
                disabled
              />

              <div className="space-y-2">
                <Input
                  label={t('settings.profile.photoURL')}
                  value={photoURL}
                  onChange={(value) => {
                    resetProfileFeedback();
                    setPhotoURL(String(value));
                  }}
                  placeholder={t('settings.account.profile.photoPlaceholder')}
                  autoComplete="url"
                />
                <p className="text-xs text-foreground/50">
                  {t('settings.account.profile.photoHint')}
                </p>
                {!photoUrlIsValid && (
                  <p className="text-xs font-semibold text-totoro-orange">
                    {t('settings.account.profile.validation.photoUrl')}
                  </p>
                )}
              </div>
            </div>

            {profileFeedback.message && (
              <div
                className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                  profileFeedback.status === 'saved'
                    ? 'bg-totoro-green/10 text-totoro-green shadow-[inset_0_0_0_1px_rgba(var(--success-rgb),0.18)]'
                    : profileFeedback.status === 'error'
                      ? 'bg-totoro-orange/10 text-totoro-orange shadow-[inset_0_0_0_1px_rgba(var(--danger-rgb),0.18)]'
                      : 'bg-totoro-blue/10 text-totoro-blue shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.18)]'
                }`}
              >
                {profileFeedback.message}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleProfileSave}
                disabled={!hasProfileChanges || profileFeedback.status === 'saving'}
                className="w-full sm:w-auto"
              >
                {profileFeedback.status === 'saving'
                  ? t('ui.actions.saving')
                  : t('settings.profile.save')}
              </Button>
            </div>
          </div>
        </ContentCard>

        <div className="space-y-6">
          <ContentCard title={t('settings.account.appearance.title')}>
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4 shadow-[inset_0_0_0_1px_var(--hairline)]">
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-totoro-blue" />
                    <h3 className="text-sm font-semibold text-foreground">
                      {t('settings.appearance.title')}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-foreground/50">
                    {t('settings.appearance.desc')}
                  </p>
                </div>
                <ThemeSwitch />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-totoro-blue" />
                  <h3 className="text-sm font-semibold text-foreground">
                    {t('settings.language.title')}
                  </h3>
                </div>
                <Select
                  value={settings.language}
                  onChange={(value) => updateSetting('language', value as typeof settings.language)}
                  options={[...LANGUAGE_OPTIONS]}
                  placeholder={t('settings.language.placeholder')}
                  label={t('settings.language.label')}
                />
              </div>
            </div>
          </ContentCard>

          <ContentCard title={t('settings.account.security.title')}>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/30 p-4 shadow-[inset_0_0_0_1px_var(--hairline)]">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-totoro-blue" />
                  <h3 className="text-sm font-semibold text-foreground">
                    {t('settings.account.security.heading')}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-foreground/50">
                  {t('settings.account.security.description')}
                </p>
              </div>

              <Input
                type="password"
                label={t('settings.account.security.currentPassword')}
                value={currentPassword}
                onChange={(value) => {
                  resetSecurityFeedback();
                  setCurrentPassword(String(value));
                }}
                autoComplete="current-password"
              />

              <Input
                type="password"
                label={t('settings.profile.newPassword')}
                value={newPassword}
                onChange={(value) => {
                  resetSecurityFeedback();
                  setNewPassword(String(value));
                }}
                autoComplete="new-password"
              />

              <Input
                type="password"
                label={t('settings.profile.confirmPassword')}
                value={confirmPassword}
                onChange={(value) => {
                  resetSecurityFeedback();
                  setConfirmPassword(String(value));
                }}
                autoComplete="new-password"
              />

              {passwordValidationError && (
                <p className="text-xs font-semibold text-totoro-orange">
                  {passwordValidationError}
                </p>
              )}

              {securityFeedback.message && (
                <div
                  className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                    securityFeedback.status === 'saved'
                      ? 'bg-totoro-green/10 text-totoro-green shadow-[inset_0_0_0_1px_rgba(var(--success-rgb),0.18)]'
                      : securityFeedback.status === 'error'
                        ? 'bg-totoro-orange/10 text-totoro-orange shadow-[inset_0_0_0_1px_rgba(var(--danger-rgb),0.18)]'
                        : 'bg-totoro-blue/10 text-totoro-blue shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.18)]'
                  }`}
                >
                  {securityFeedback.message}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-totoro-blue/5 p-4 shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.12)]">
                <div className="flex items-center gap-2 text-sm font-medium text-totoro-blue">
                  <Sparkles className="h-4 w-4" />
                  {t('settings.account.security.tip')}
                </div>
                <Button
                  onClick={handlePasswordSave}
                  disabled={
                    securityFeedback.status === 'saving' ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    !!passwordValidationError
                  }
                  className="w-full sm:w-auto"
                >
                  {securityFeedback.status === 'saving'
                    ? t('ui.actions.saving')
                    : t('settings.account.security.save')}
                </Button>
              </div>
            </div>
          </ContentCard>
        </div>
      </div>
    </SettingsHubLayout>
  );
}
