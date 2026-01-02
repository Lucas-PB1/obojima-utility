import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { UserProfile } from '@/types/auth';
import { Modal } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useAdminUserDetails } from '@/hooks/useAdminUserDetails';

import {
  AdminUserPotionsTab,
  AdminUserHistoryTab,
  AdminUserOverviewTab,
  AdminUserInventoryTab
} from '@/components/Admin/modal';

interface AdminUserDetailsModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (uid: string, data: Partial<UserProfile>) => Promise<void>;
  onDelete: (uid: string, name: string) => Promise<void>;
}

export function AdminUserDetailsModal({
  user,
  isOpen,
  onClose,
  onUpdate,
  onDelete
}: AdminUserDetailsModalProps) {
  const { t } = useTranslation();

  const {
    activeTab,
    setActiveTab,
    loading,
    ingredientsData,
    potionsData,
    historyData,
    userActions
  } = useAdminUserDetails({
    user,
    isOpen,
    onUpdate,
    onDelete,
    onClose
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!user) return null;

  const TabButton = ({ id, label, icon }: { id: string; label: string; icon: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-3 font-medium text-sm transition-all duration-300 border-b-2 relative flex items-center justify-center gap-2 ${
        activeTab === id
          ? 'text-totoro-blue border-totoro-blue bg-totoro-blue/10'
          : 'text-totoro-gray border-transparent hover:text-totoro-blue hover:border-totoro-blue/30 hover:bg-totoro-blue/5'
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user.displayName || t('admin.modal.title.fallback')}
      size="3xl"
    >
      <div className="w-full h-[85vh] flex flex-col">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="grid w-full grid-cols-4 mb-4 border-b border-white/20 shrink-0">
            <TabButton id="overview" label={t('admin.modal.tabs.overview')} icon="👤" />
            <TabButton id="inventory" label={t('admin.modal.tabs.inventory')} icon="🎒" />
            <TabButton id="potions" label={t('admin.modal.tabs.potions')} icon="🧪" />
            <TabButton id="history" label={t('admin.modal.tabs.history')} icon="📜" />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar p-2">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-totoro-green" />
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <AdminUserOverviewTab
                    user={user}
                    stats={{
                      ingredientsCount: ingredientsData.ingredients.length,
                      potionsCount: potionsData.potions.length,
                      attemptsCount: historyData.attempts.length
                    }}
                    actions={userActions}
                  />
                )}

                {activeTab === 'inventory' && <AdminUserInventoryTab data={ingredientsData} />}

                {activeTab === 'potions' && <AdminUserPotionsTab data={potionsData} />}

                {activeTab === 'history' && <AdminUserHistoryTab data={historyData} />}
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
