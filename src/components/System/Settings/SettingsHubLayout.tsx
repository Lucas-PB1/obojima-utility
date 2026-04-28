'use client';
import type { User } from 'firebase/auth';
import { UserProfile } from '@/types/auth';
import { AppShellFrame } from '@/components/AppShell/AppShellFrame';
import { SettingsSwitcher } from '@/components/AppShell/SettingsSwitcher';
import { PageLayout } from '@/components/ui';

interface SettingsHubLayoutProps {
  section: 'account' | 'player';
  user: User | null;
  userProfile?: UserProfile | null;
  onLogout: () => void;
  children: React.ReactNode;
}

export function SettingsHubLayout({
  section,
  user,
  userProfile,
  onLogout,
  children
}: SettingsHubLayoutProps) {
  return (
    <AppShellFrame
      user={user}
      userProfile={userProfile}
      onLogout={onLogout}
      navigation={<SettingsSwitcher section={section} />}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 mb-10">
        <PageLayout variant="simple" className="py-4!">
          {children}
        </PageLayout>
      </div>
    </AppShellFrame>
  );
}
