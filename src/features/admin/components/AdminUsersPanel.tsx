'use client';
import React from 'react';
import { ChevronRight, Download, Loader2, Search, Users } from 'lucide-react';
import { Button, UserAvatar } from '@/components/ui';
import type { AdminDashboardModel } from '../hooks/useAdminDashboard';
import { EmptyPanel, formatDateTime, formatRelativeTime, RoleBadge, StatusBadge } from './adminUi';

const selectClass =
  'rounded-lg bg-[var(--input-bg)] px-3 py-2.5 text-sm font-bold text-foreground shadow-[inset_0_0_0_1px_var(--hairline)] outline-none focus:ring-4 focus:ring-totoro-blue/15';

export function AdminUsersPanel({ admin }: { admin: AdminDashboardModel }) {
  const total = admin.dashboard.users.length;
  const filtersActive =
    admin.query.trim() !== '' || admin.statusFilter !== 'all' || admin.roleFilter !== 'all';

  return (
    <section className="surface-raised overflow-hidden rounded-lg">
      <div className="space-y-3 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
          <input
            type="search"
            value={admin.query}
            onChange={(event) => admin.setQuery(event.target.value)}
            placeholder="Buscar por nome, email ou UID"
            aria-label="Buscar usuários"
            className="w-full rounded-lg bg-[var(--input-bg)] py-3 pl-10 pr-3 text-sm font-medium text-foreground shadow-[inset_0_0_0_1px_var(--hairline)] outline-none transition focus:ring-4 focus:ring-totoro-blue/15"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={admin.statusFilter}
            onChange={(event) =>
              admin.setStatusFilter(event.target.value as typeof admin.statusFilter)
            }
            aria-label="Filtrar por status"
            className={selectClass}
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="disabled">Desativados</option>
            <option value="orphaned">Órfãos</option>
          </select>
          <select
            value={admin.roleFilter}
            onChange={(event) => admin.setRoleFilter(event.target.value as typeof admin.roleFilter)}
            aria-label="Filtrar por função"
            className={selectClass}
          >
            <option value="all">Todas as funções</option>
            <option value="user">Jogadores</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={admin.sort}
            onChange={(event) => admin.setSort(event.target.value as typeof admin.sort)}
            aria-label="Ordenar"
            className={selectClass}
          >
            <option value="name">Ordenar por nome</option>
            <option value="recent">Mais recentes</option>
            <option value="lastLogin">Último acesso</option>
          </select>
          {filtersActive && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                admin.setQuery('');
                admin.setStatusFilter('all');
                admin.setRoleFilter('all');
              }}
            >
              Limpar filtros
            </Button>
          )}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs font-bold text-foreground/55">
              {admin.users.length} de {total}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={admin.exportUsersCsv}
              disabled={admin.users.length === 0}
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="subtle-divider-top">
        <div className="hidden grid-cols-[minmax(0,1fr)_110px_140px_140px_20px] gap-3 px-5 py-2 text-[11px] font-black uppercase tracking-wide text-foreground/45 md:grid">
          <span>Usuário</span>
          <span>Status</span>
          <span>Criado</span>
          <span>Último acesso</span>
          <span />
        </div>
        {admin.loading && total === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-totoro-blue" />
          </div>
        ) : admin.users.length === 0 ? (
          <div className="p-4">
            <EmptyPanel
              icon={<Users className="h-6 w-6 opacity-50" />}
              label="Nenhum usuário corresponde aos filtros."
            />
          </div>
        ) : (
          <ul className="divide-y divide-[var(--hairline)]">
            {admin.users.map((user) => (
              <li key={user.uid}>
                <button
                  type="button"
                  onClick={() => admin.openUser(user.uid)}
                  className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left transition hover:bg-[var(--surface-hover)] focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-totoro-blue/20 md:grid-cols-[minmax(0,1fr)_110px_140px_140px_20px] md:px-5"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <UserAvatar
                      src={user.photoURL}
                      name={user.displayName}
                      email={user.email}
                      className="h-10 w-10 shrink-0 border border-[var(--hairline)] text-sm"
                    />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-black text-foreground">
                          {user.displayName || 'Sem nome'}
                        </span>
                        <RoleBadge role={user.role} />
                        {user.uid === admin.currentUid && (
                          <span className="text-[10px] font-bold text-foreground/45">(você)</span>
                        )}
                      </span>
                      <span className="block truncate text-xs text-foreground/55">
                        {user.email || user.uid}
                      </span>
                    </span>
                  </span>
                  <span className="md:hidden">
                    <StatusBadge user={user} />
                  </span>
                  <span className="hidden md:block">
                    <StatusBadge user={user} />
                  </span>
                  <span className="hidden text-xs text-foreground/60 md:block">
                    {formatDateTime(user.createdAt, false)}
                  </span>
                  <span
                    className="hidden text-xs text-foreground/60 md:block"
                    title={formatDateTime(user.lastLogin)}
                  >
                    {formatRelativeTime(user.lastLogin)}
                  </span>
                  <ChevronRight className="hidden h-4 w-4 text-foreground/35 transition group-hover:text-totoro-blue md:block" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
