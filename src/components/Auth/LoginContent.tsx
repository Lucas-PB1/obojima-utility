'use client';
import React from 'react';
import { Input, Button } from '@/components/ui';
import { useLogin } from '@/hooks/useLogin';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettings } from '@/hooks/useSettings';

export default function LoginContent() {
  const { t } = useTranslation();
  const { isInitialized } = useSettings();
  const {
    isLogin,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    handleSubmit,
    toggleMode
  } = useLogin();

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-totoro-blue/10 to-totoro-green/10 flex items-center justify-center p-4">
        <div className="text-3xl animate-bounce">🌿</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-lg shadow-[var(--shadow-raised)] p-8 border-transparent bg-[var(--surface-raised)]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-totoro-gray mb-2">🌿 Obojima Utilities</h1>
            <p className="text-totoro-blue">
              {isLogin ? t('auth.login.title') : t('auth.register.title')}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-totoro-orange/10 rounded-lg text-totoro-orange text-sm shadow-[inset_0_0_0_1px_rgba(var(--danger-rgb),0.18)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(val) => setEmail(String(val))}
              placeholder="seu@email.com"
              label={t('auth.email')}
              className="w-full"
            />

            <Input
              type="password"
              value={password}
              onChange={(val) => setPassword(String(val))}
              placeholder="••••••••"
              label={t('auth.password')}
              className="w-full"
            />

            {!isLogin && (
              <Input
                type="password"
                value={confirmPassword}
                onChange={(val) => setConfirmPassword(String(val))}
                placeholder="••••••••"
                label={t('auth.confirmPassword')}
                className="w-full"
              />
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={
                loading || !email || !password || (!isLogin && password !== confirmPassword)
              }
              className="mt-6"
            >
              {loading
                ? t('auth.submit.loading')
                : isLogin
                  ? t('auth.submit.login')
                  : t('auth.submit.register')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-totoro-blue hover:text-totoro-blue/80 transition-colors"
            >
              {isLogin ? t('auth.toggle.toRegister') : t('auth.toggle.toLogin')}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-totoro-gray/70">
          <p>{t('auth.footer.sync')}</p>
        </div>
      </div>
    </div>
  );
}
