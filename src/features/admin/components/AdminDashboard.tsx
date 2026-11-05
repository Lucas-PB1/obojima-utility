'use client';
import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Flag,
  LayoutDashboard,
  RefreshCw,
  ScrollText,
  Shield,
  Users,
  Wrench
} from 'lucide-react';
import { Button } from '@/components/ui';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AdminSection, useAdminDashboard } from '../hooks/useAdminDashboard';
import { AdminAuditList } from './AdminAuditList';
import { AdminMaintenancePanel } from './AdminMaintenancePanel';
import { AdminOverview } from './AdminOverview';
import { AdminReportsPanel } from './AdminReportsPanel';
import { AdminUserPanel } from './AdminUserPanel';
import { AdminUsersPanel } from './AdminUsersPanel';
import { AdminToasts, Panel } from './adminUi';

const SECTIONS: Array<{ id: AdminSection; label: string; icon: typeof Users }> = [
  { id: 'overview', label: 'Visão geral', icon: LayoutDashboard },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'reports', label: 'Denúncias', icon: Flag },
  { id: 'audit', label: 'Registro', icon: ScrollText },
  { id: 'maintenance', label: 'Manutenção', icon: Wrench }
];

export function AdminDashboard() {
  const admin = useAdminDashboard();

  const badgeFor = (id: AdminSection) => {
    if (id === 'reports') return admin.openReports.length;
    return 0;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-foreground">
      <header className="sticky top-0 z-40 glass-panel subtle-divider-bottom shadow-[var(--shadow-soft)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground/70 transition hover:bg-totoro-blue/10 hover:text-totoro-blue"
              aria-label="Voltar ao app"
              title="Voltar ao app"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Shield className="hidden h-5 w-5 text-totoro-blue sm:block" />
                <h1 className="truncate text-base font-black tracking-tight sm:text-lg md:text-xl">
                  <span className="sm:hidden">Admin</span>
                  <span className="hidden sm:inline">Painel de administração</span>
                </h1>
                {admin.mode === 'demo' && (
                  <span className="rounded-full bg-totoro-orange/12 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-totoro-orange">
                    Demo local
                  </span>
                )}
              </div>
            </div>
            <ThemeToggle />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void admin.refresh()}
              disabled={admin.loading}
              title="Atualizar dados"
            >
              <RefreshCw className={`h-4 w-4 ${admin.loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>

          <nav
            className="-mx-1 flex gap-1 overflow-x-auto px-1 no-scrollbar"
            role="tablist"
            aria-label="Seções do admin"
          >
            {SECTIONS.map(({ id, label, icon: Icon }) => {
              const active = admin.section === id;
              const badge = badgeFor(id);
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => admin.setSection(id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${
                    active
                      ? 'bg-totoro-blue text-white shadow-md'
                      : 'text-foreground/65 hover:bg-totoro-blue/10 hover:text-totoro-blue'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {badge > 0 && (
                    <span
                      className={`rounded-full px-1.5 text-[11px] font-black ${
                        active
                          ? 'bg-white/25'
                          : id === 'reports'
                            ? 'bg-totoro-orange text-white'
                            : 'bg-foreground/10'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-5 md:px-8">
        {admin.mode === 'demo' && (
          <div className="flex items-start gap-3 rounded-lg border border-totoro-orange/25 bg-totoro-orange/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-totoro-orange" />
            <p className="text-foreground/75">
              <strong className="text-foreground">Modo demonstração.</strong> As ações alteram
              apenas dados locais deste navegador. Configure o Firebase para administrar contas
              reais.
            </p>
          </div>
        )}

        {admin.section === 'overview' && <AdminOverview admin={admin} />}
        {admin.section === 'users' && <AdminUsersPanel admin={admin} />}
        {admin.section === 'reports' && (
          <Panel
            title="Fila de moderação"
            description="Denúncias feitas pelos jogadores, mais recentes primeiro."
          >
            <AdminReportsPanel
              reports={admin.reports}
              busy={admin.busy}
              onOpenUser={admin.openUser}
              onSetStatus={admin.actions.setReportStatus}
              onDisableUser={(uid) => admin.actions.setDisabled(uid, true)}
            />
          </Panel>
        )}
        {admin.section === 'audit' && (
          <Panel
            title="Registro de ações"
            description="Tudo o que a equipe fez pelo painel, mais recente primeiro."
          >
            <AdminAuditList entries={admin.audit} onOpenUser={admin.openUser} searchable />
          </Panel>
        )}
        {admin.section === 'maintenance' && <AdminMaintenancePanel admin={admin} />}
      </main>

      <AdminUserPanel admin={admin} />
      <AdminToasts toasts={admin.toasts} onDismiss={admin.dismissToast} />
    </div>
  );
}
