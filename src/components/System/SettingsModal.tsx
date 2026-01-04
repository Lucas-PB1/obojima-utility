'use client';
import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Modal } from '@/components/ui';
import { ProfileTab } from './Settings/ProfileTab';
import { PreferencesTab } from './Settings/PreferencesTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')} size="md">
      <SettingsContent onClose={onClose} />
    </Modal>
  );
}

function SettingsContent({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');

  return (
    <div className="w-full">
      <div className="flex p-1 bg-muted/30 rounded-lg mb-6 border border-border/50">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'profile'
              ? 'bg-white shadow-sm text-totoro-blue'
              : 'text-totoro-gray/60 hover:text-totoro-gray'
          }`}
        >
          {t('settings.tabs.profile')}
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'preferences'
              ? 'bg-white shadow-sm text-totoro-blue'
              : 'text-totoro-gray/60 hover:text-totoro-gray'
          }`}
        >
          {t('settings.tabs.preferences')}
        </button>
      </div>

      {activeTab === 'profile' ? (
        <ProfileTab onClose={onClose} />
      ) : (
        <PreferencesTab onClose={onClose} />
      )}
    </div>
  );
}
