'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import { Gift, Leaf, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '@/types/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { Button, UserAvatar } from '@/components/ui';

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

  const displayName = useMemo(() => {
    const rawName =
      userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';
    return rawName.trim() || 'User';
  }, [user?.displayName, user?.email, userProfile?.displayName]);

  const displayEmail = userProfile?.email || user?.email || '';
  const photoURL = userProfile?.photoURL || user?.photoURL;

  return (
    <main className="min-h-screen bg-mesh bg-topo transition-all duration-500">
      <header className="sticky top-0 z-50 glass-panel subtle-divider-bottom shadow-[var(--shadow-soft)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-xl md:text-3xl font-serif font-bold text-totoro-gray tracking-tight transition-all duration-300">
                <span className="inline-flex items-center gap-2">
                  <Leaf className="h-6 w-6 text-totoro-blue" />
                  {t('app.header.title')}
                </span>
              </h1>
              <p className="text-[8px] md:text-[10px] font-semibold text-totoro-blue/70 uppercase tracking-[0.2em] font-sans -mt-1">
                {t('app.header.subtitle')}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              {headerAside}

              {user && (
                <div className="flex items-center bg-totoro-blue/5 rounded-lg border border-transparent pl-2 pr-2 py-1.5 gap-2 shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.12),var(--shadow-soft)] transition-all hover:bg-[var(--surface-hover)] hover:shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.22),var(--shadow-soft)]">
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
                    <div className="min-w-0 flex flex-col">
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
                    <span className="hidden sm:inline">{t('app.user.logout')}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {navigation}
        </div>
      </header>

      {children}

      {mobileNavigation}

      <footer
        className={`${mobileNavigation ? 'pt-6 pb-32 md:py-6' : 'py-6'} subtle-divider-top`}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black text-totoro-blue/20 uppercase tracking-[0.4em]">
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
