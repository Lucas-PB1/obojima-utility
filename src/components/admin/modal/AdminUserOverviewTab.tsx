import React from 'react';
import { UserProfile } from '@/types/auth';
import { useTranslation } from '@/hooks/useTranslation';

interface AdminUserOverviewTabProps {
  user: UserProfile;
  stats: {
    ingredientsCount: number;
    potionsCount: number;
    attemptsCount: number;
  };
  actions: {
    handleEditName: () => void;
    handleToggleStatus: () => void;
    handleChangeRole: (role: string) => void;
    handleDeleteUser: () => void;
  };
}

export function AdminUserOverviewTab({ user, stats, actions }: AdminUserOverviewTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-totoro-green">
            {t('admin.modal.section.profile')}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={actions.handleEditName}
              className="px-3 py-1 text-xs font-bold text-totoro-blue bg-totoro-blue/10 rounded-lg hover:bg-totoro-blue hover:text-white transition-colors"
            >
              {t('admin.users.action.edit')}
            </button>
            <button
              onClick={actions.handleToggleStatus}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${user.disabled ? 'text-green-600 bg-green-100 hover:bg-green-600 hover:text-white' : 'text-amber-600 bg-amber-100 hover:bg-amber-600 hover:text-white'}`}
            >
              {user.disabled ? t('admin.users.action.enable') : t('admin.users.action.disable')}
            </button>
            <button
              onClick={actions.handleDeleteUser}
              className="px-3 py-1 text-xs font-bold text-red-600 bg-red-100 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
            >
              {t('admin.users.action.delete')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">{t('admin.users.col.name')}</label>
            <p className="font-medium">{user.displayName || t('admin.users.noName')}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">{t('admin.users.col.email')}</label>
            <p className="font-medium">{user.email || t('admin.users.noEmail')}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">{t('admin.users.col.role')}</label>
            <div className="flex items-center gap-2">
              <select
                value={user.role}
                onChange={(e) => actions.handleChangeRole(e.target.value)}
                className="bg-transparent font-medium capitalize outline-none cursor-pointer hover:bg-black/5 rounded px-1"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500">UID</label>
            <p className="font-medium text-xs font-mono">{user.uid}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">{t('admin.users.col.status')}</label>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
            >
              {user.disabled ? t('admin.users.status.disabled') : t('admin.users.status.active')}
            </span>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-bold mb-4 text-totoro-blue">
          {t('admin.modal.section.stats')}
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white/50 rounded-lg">
            <div className="text-2xl font-bold text-totoro-green">{stats.ingredientsCount}</div>
            <div className="text-xs text-gray-600">{t('admin.modal.tabs.inventory')}</div>
          </div>
          <div className="p-3 bg-white/50 rounded-lg">
            <div className="text-2xl font-bold text-totoro-blue">{stats.potionsCount}</div>
            <div className="text-xs text-gray-600">{t('admin.modal.tabs.potions')}</div>
          </div>
          <div className="p-3 bg-white/50 rounded-lg">
            <div className="text-2xl font-bold text-totoro-orange">{stats.attemptsCount}</div>
            <div className="text-xs text-gray-600">{t('admin.modal.tabs.history')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
