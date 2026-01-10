import React from 'react';
import Image from 'next/image';
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
        {/* Header Profile */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-totoro-blue/10 flex items-center justify-center text-4xl border-4 border-white shadow-lg shrink-0 relative overflow-hidden">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || ''}
                fill
                className="object-cover"
              />
            ) : (
              (user.displayName?.[0] || user.email?.[0] || '?').toUpperCase()
            )}
          </div>
          <div className="flex-1 text-center md:text-left space-y-2 w-full">
            <div>
              <h3 className="text-2xl font-black text-totoro-gray tracking-tight">
                {user.displayName || t('admin.users.noName')}
              </h3>
              <p className="text-sm font-medium text-totoro-gray/60 truncate">
                {user.email || t('admin.users.noEmail')}
              </p>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  user.role === 'admin'
                    ? 'bg-totoro-blue/10 text-totoro-blue'
                    : 'bg-totoro-gray/10 text-totoro-gray/60'
                }`}
              >
                {user.role}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  !user.disabled
                    ? 'bg-totoro-green/10 text-totoro-green'
                    : 'bg-totoro-orange/10 text-totoro-orange'
                }`}
              >
                {!user.disabled ? t('admin.users.status.active') : t('admin.users.status.disabled')}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <button
            onClick={actions.handleEditName}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-totoro-blue/5 hover:bg-totoro-blue/10 text-totoro-blue transition-colors gap-1 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">✏️</span>
            <span className="text-[10px] font-black uppercase tracking-wider">
              {t('admin.users.action.edit')}
            </span>
          </button>
          <button
            onClick={actions.handleToggleStatus}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-colors gap-1 group ${
              !user.disabled
                ? 'bg-totoro-orange/5 hover:bg-totoro-orange/10 text-totoro-orange'
                : 'bg-totoro-green/5 hover:bg-totoro-green/10 text-totoro-green'
            }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">
              {!user.disabled ? '🚫' : '✅'}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider">
              {user.disabled ? t('admin.users.action.enable') : t('admin.users.action.disable')}
            </span>
          </button>
          <button
            onClick={actions.handleDeleteUser}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors gap-1 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🗑️</span>
            <span className="text-[10px] font-black uppercase tracking-wider">
              {t('admin.users.action.delete')}
            </span>
          </button>
        </div>

        {/* Details Data */}
        <div className="grid grid-cols-1 gap-4 p-4 bg-totoro-gray/5 rounded-2xl border border-totoro-gray/5">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-totoro-gray/40 mb-1 block">
              UID
            </label>
            <code className="text-xs font-mono text-totoro-gray/80 break-all bg-white/50 px-2 py-1 rounded block select-all">
              {user.uid}
            </code>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-totoro-gray/40 mb-1 block">
              {t('admin.users.col.role')}
            </label>
            <select
              value={user.role}
              onChange={(e) => actions.handleChangeRole(e.target.value)}
              className="w-full bg-white/80 border border-totoro-gray/10 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-totoro-blue/20"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-black text-totoro-gray mb-6 flex items-center gap-2">
          <span className="text-xl">📊</span>
          {t('admin.modal.section.stats')}
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-black text-totoro-green mb-1">
              {stats.ingredientsCount}
            </div>
            <div className="text-[10px] font-bold text-totoro-gray/40 uppercase tracking-widest">
              {t('admin.modal.tabs.inventory')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-totoro-blue mb-1">{stats.potionsCount}</div>
            <div className="text-[10px] font-bold text-totoro-gray/40 uppercase tracking-widest">
              {t('admin.modal.tabs.potions')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-totoro-orange mb-1">{stats.attemptsCount}</div>
            <div className="text-[10px] font-bold text-totoro-gray/40 uppercase tracking-widest">
              {t('admin.modal.tabs.history')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
