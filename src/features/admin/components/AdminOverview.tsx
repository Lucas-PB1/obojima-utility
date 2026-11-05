'use client';
import React from 'react';
import { CheckCircle2, Flag, KeyRound, Moon, Shield, Users, type LucideIcon } from 'lucide-react';
import { Button, UserAvatar } from '@/components/ui';
import { getAdminUserStatus } from '../domain/adminRules';
import type { AdminDashboardModel } from '../hooks/useAdminDashboard';
import { AdminAuditList } from './AdminAuditList';
import { AdminReportsPanel } from './AdminReportsPanel';
import { formatRelativeTime, Panel } from './adminUi';

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  onClick
}: {
  label: string;
  value: number;
  hint?: string;
  icon: LucideIcon;
  tone: 'blue' | 'green' | 'orange' | 'gray';
  onClick?: () => void;
}) {
  const toneClass = {
    blue: 'text-totoro-blue bg-totoro-blue/10',
    green: 'text-totoro-green bg-totoro-green/10',
    orange: 'text-totoro-orange bg-totoro-orange/10',
    gray: 'text-foreground/70 bg-foreground/8'
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="surface-raised rounded-lg p-4 text-left transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-[var(--shadow-raised)] disabled:cursor-default"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-foreground/55">{label}</p>
          <p className="mt-1 text-2xl font-black text-foreground">{value}</p>
          {hint && <p className="mt-0.5 text-[11px] text-foreground/45">{hint}</p>}
        </div>
        <span className={`rounded-lg p-2.5 ${toneClass[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </button>
  );
}

export function AdminOverview({ admin }: { admin: AdminDashboardModel }) {
  const { stats, users } = admin.dashboard;

  const goToUsers = (status: typeof admin.statusFilter, role: typeof admin.roleFilter = 'all') => {
    admin.setStatusFilter(status);
    admin.setRoleFilter(role);
    admin.setSection('users');
  };

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);
  const orphaned = users.filter((user) => getAdminUserStatus(user) === 'orphaned');

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Usuários"
          value={stats.totalUsers}
          icon={Users}
          tone="blue"
          onClick={() => goToUsers('all')}
        />
        <StatCard
          label="Ativos"
          value={stats.active}
          icon={CheckCircle2}
          tone="green"
          onClick={() => goToUsers('active')}
        />
        <StatCard
          label="Admins"
          value={stats.admins}
          icon={Shield}
          tone="orange"
          onClick={() => goToUsers('all', 'admin')}
        />
        <StatCard
          label="Desativados"
          value={stats.disabled}
          icon={KeyRound}
          tone="orange"
          onClick={() => goToUsers('disabled')}
        />
        <StatCard
          label="Órfãos"
          value={stats.orphaned}
          hint="Sem conta no Auth"
          icon={Moon}
          tone="gray"
          onClick={() => goToUsers('orphaned')}
        />
        <StatCard
          label="Denúncias abertas"
          value={admin.openReports.length}
          icon={Flag}
          tone={admin.openReports.length > 0 ? 'orange' : 'gray'}
          onClick={() => admin.setSection('reports')}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel
          title="Precisa de atenção"
          description="Denúncias abertas mais recentes"
          actions={
            admin.openReports.length > 3 && (
              <Button size="sm" variant="ghost" onClick={() => admin.setSection('reports')}>
                Ver todas ({admin.openReports.length})
              </Button>
            )
          }
        >
          <AdminReportsPanel
            compact
            reports={admin.openReports}
            busy={admin.busy}
            onOpenUser={admin.openUser}
            onSetStatus={admin.actions.setReportStatus}
            onDisableUser={(uid) => admin.actions.setDisabled(uid, true)}
          />
        </Panel>

        <div className="space-y-5">
          <Panel title="Novos jogadores" description="Últimas contas criadas">
            <ul className="divide-y divide-[var(--hairline)]">
              {recentUsers.map((user) => (
                <li key={user.uid}>
                  <button
                    type="button"
                    onClick={() => admin.openUser(user.uid)}
                    className="flex w-full items-center gap-3 py-2 text-left hover:text-totoro-blue"
                  >
                    <UserAvatar
                      src={user.photoURL}
                      name={user.displayName}
                      email={user.email}
                      className="h-8 w-8 shrink-0 text-xs"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">
                      {user.displayName || user.email || user.uid}
                    </span>
                    <span className="shrink-0 text-xs text-foreground/50">
                      {formatRelativeTime(user.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          {orphaned.length > 0 && (
            <Panel
              title={`${orphaned.length} conta(s) órfã(s)`}
              description="Existem no banco, mas não no Firebase Auth: a pessoa não consegue entrar. Revise e exclua se não forem mais necessárias."
              actions={
                <Button size="sm" variant="secondary" onClick={() => goToUsers('orphaned')}>
                  Revisar
                </Button>
              }
            >
              <p className="text-xs text-foreground/55">
                Rode a sincronização em Manutenção para atualizar essa lista.
              </p>
            </Panel>
          )}
        </div>
      </div>

      <Panel
        title="Atividade recente da equipe"
        actions={
          <Button size="sm" variant="ghost" onClick={() => admin.setSection('audit')}>
            Ver registro completo
          </Button>
        }
      >
        <AdminAuditList entries={admin.audit.slice(0, 6)} onOpenUser={admin.openUser} />
      </Panel>
    </div>
  );
}
