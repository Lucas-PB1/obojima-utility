'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import { Coins, Gift, Leaf, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '@/types/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { Button, UserAvatar } from '@/components/ui';
import { useSettings } from '@/hooks/useSettings';

interface AppShellFrameProps {
  user: User | null;
  userProfile?: UserProfile | null;
  onLogout: () => void;
  children: React.ReactNode;
  navigation?: React.ReactNode;
  mobileNavigation?: React.ReactNode;
  headerAside?: React.ReactNode;
}

export function AppShellFrame({
  user,
  userProfile,
  onLogout,
  children,
  navigation,
  mobileNavigation,
  headerAside
}: AppShellFrameProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { settings, updateSetting, flushPendingSave } = useSettings();

  const displayName = useMemo(() => {
    const rawName =
      userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';
    return rawName.trim() || 'User';
  }, [user?.displayName, user?.email, userProfile?.displayName]);

  const displayEmail = userProfile?.email || user?.email || '';
  const photoURL = userProfile?.photoURL || user?.photoURL;

  return (
    <main className="min-h-screen bg-mesh bg-topo transition-all duration-500">
      <header className="sticky top-0 z-40 glass-panel subtle-divider-bottom shadow-[var(--shadow-soft)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl md:text-3xl font-serif font-bold text-totoro-gray tracking-tight transition-all duration-300">
                  <span className="inline-flex items-center gap-2">
                    <Leaf className="h-6 w-6 text-totoro-blue" />
                    {t('app.header.title')}
                  </span>
                </h1>
                <p className="hidden sm:block text-[10px] font-semibold text-totoro-blue/70 uppercase tracking-[0.2em] font-sans -mt-1">
                  {t('app.header.subtitle')}
                </p>
              </div>

              {user && (
                <div className="flex shrink-0 items-center gap-1 sm:hidden">
                  <button
                    type="button"
                    onClick={() => router.push('/settings/account')}
                    aria-label={t('app.user.account')}
                    title={displayName}
                    className="rounded-lg p-0.5 transition hover:bg-totoro-blue/10"
                  >
                    <UserAvatar
                      src={photoURL}
                      name={displayName}
                      email={displayEmail}
                      shape="rounded"
                      className="h-9 w-9"
                      iconClassName="h-4 w-4"
                      fallbackClassName="text-sm"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    aria-label={t('app.user.logout')}
                    title={t('app.user.logout')}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-totoro-gray/70 transition hover:bg-totoro-orange/10 hover:text-totoro-orange"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 xl:justify-end">
              {headerAside}

              {user && (
                <>
                  <div className="flex items-center rounded-lg bg-totoro-yellow/10 px-1.5 py-1 shadow-[inset_0_0_0_1px_rgba(var(--whimsy-rgb),0.18),var(--shadow-soft)] sm:px-2 sm:py-1.5">
                    <button
                      type="button"
                      onClick={() => updateSetting('gold', Math.max(0, (settings.gold || 0) - 25))}
                      onBlur={() => void flushPendingSave()}
                      className="h-8 w-7 rounded-lg text-sm font-black text-totoro-orange transition hover:bg-totoro-yellow/20 sm:w-8"
                      aria-label={t('app.gold.remove', 25)}
                      title={t('app.gold.remove', 25)}
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/settings/player')}
                      className="flex items-center justify-center gap-1.5 rounded-lg px-1.5 py-1 text-totoro-orange transition hover:bg-totoro-yellow/20 sm:min-w-[92px] sm:px-2"
                      aria-label={`${settings.gold || 0} gold`}
                    >
                      <Coins className="h-4 w-4" />
                      <span className="text-xs font-black uppercase tracking-[0.12em]">
                        {settings.gold || 0}
                        <span className="hidden sm:inline"> gold</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSetting('gold', (settings.gold || 0) + 25)}
                      onBlur={() => void flushPendingSave()}
                      className="h-8 w-7 rounded-lg text-sm font-black text-totoro-orange transition hover:bg-totoro-yellow/20 sm:w-8"
                      aria-label={t('app.gold.add', 25)}
                      title={t('app.gold.add', 25)}
                    >
                      +
                    </button>
                  </div>

                  <div className="hidden sm:flex items-center bg-totoro-blue/5 rounded-lg border border-transparent pl-2 pr-2 py-1.5 gap-2 shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.12),var(--shadow-soft)] transition-all hover:bg-[var(--surface-hover)] hover:shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.22),var(--shadow-soft)]">
                    <button
                      type="button"
                      onClick={() => router.push('/settings/account')}
                      className="flex min-w-0 items-center gap-3 rounded-lg px-2 py-1 text-left transition-colors hover:bg-white/40"
                    >
                      <UserAvatar
                        src={photoURL}
                        name={displayName}
                        email={displayEmail}
                        shape="rounded"
                        className="h-10 w-10 shrink-0"
                        iconClassName="h-5 w-5"
                        fallbackClassName="text-sm"
                      />
                      <div className="min-w-0 max-w-[180px] flex flex-col">
                        <span className="text-xs font-black text-totoro-gray truncate font-sans uppercase tracking-[0.14em]">
                          {displayName}
                        </span>
                        <span className="text-[11px] text-totoro-gray/60 truncate font-medium">
                          {displayEmail}
                        </span>
                      </div>
                    </button>

                    <Button
                      onClick={onLogout}
                      variant="ghost"
                      size="sm"
                      className="px-3! py-2! rounded-lg! text-[10px]! font-black hover:bg-totoro-orange/10 hover:text-totoro-orange transition-all"
                      title={t('app.user.logout')}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline">{t('app.user.logout')}</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {navigation}
        </div>
      </header>

      {children}

      {mobileNavigation}

      <footer className={`${mobileNavigation ? 'pt-6 pb-32 md:py-6' : 'py-6'} subtle-divider-top`}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black text-totoro-blue/50 uppercase tracking-[0.4em]">
            {t('app.footer.text')}
          </p>
        </div>
      </footer>
    </main>
  );
}

interface RecentItemsHighlightProps {
  count: number;
  onViewCollection: () => void;
}

export function RecentItemsHighlight({ count, onViewCollection }: RecentItemsHighlightProps) {
  const { t } = useTranslation();

  if (count <= 0) return null;

  return (
    <motion.div
      className="hidden lg:flex items-center bg-linear-to-r from-totoro-yellow/20 to-totoro-orange/20 px-4 py-2 rounded-lg gap-3 shadow-[inset_0_0_0_1px_rgba(var(--whimsy-rgb),0.18),var(--shadow-soft)]"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 26 }}
    >
      <div className="relative">
        <Gift className="h-5 w-5 text-totoro-orange" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-totoro-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[color:var(--surface-raised)]">
          {count}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-totoro-orange uppercase tracking-wider leading-none mb-1">
          {t('app.notification.newItems')}
        </span>
        <button
          type="button"
          onClick={onViewCollection}
          className="text-[10px] text-totoro-gray/70 hover:text-totoro-blue font-bold text-left transition-colors"
        >
          {t('app.notification.viewCollection')}
        </button>
      </div>
    </motion.div>
  );
}
