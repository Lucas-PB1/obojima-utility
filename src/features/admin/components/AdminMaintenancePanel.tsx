'use client';
import React from 'react';
import { MessagesSquare, RefreshCw, RotateCcw, UserRoundSearch } from 'lucide-react';
import { Button } from '@/components/ui';
import type { AdminDashboardModel } from '../hooks/useAdminDashboard';
import { Panel } from './adminUi';

function Job({
  icon,
  title,
  description,
  label,
  busy,
  disabled,
  onRun
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  label: string;
  busy: boolean;
  disabled?: boolean;
  onRun: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-[var(--surface-muted)] p-4 ring-1 ring-inset ring-[var(--hairline)] sm:flex-row sm:items-center">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-totoro-blue/10 text-totoro-blue">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-foreground">{title}</p>
        <p className="text-xs text-foreground/60">{description}</p>
      </div>
      <Button size="sm" variant="secondary" onClick={onRun} disabled={busy || disabled}>
        <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
        {busy ? 'Executando...' : label}
      </Button>
    </div>
  );
}

export function AdminMaintenancePanel({ admin }: { admin: AdminDashboardModel }) {
  return (
    <div className="space-y-5">
      <Panel
        title="Manutenção de dados"
        description="Rotinas seguras para rodar quando algo parecer fora de sincronia. Cada execução fica no registro."
      >
        <div className="space-y-3">
          <Job
            icon={<RefreshCw className="h-5 w-5" />}
            title="Sincronizar contas do Firebase Auth"
            description="Cria fichas para contas novas, atualiza dados de login e marca como órfãs as fichas sem conta no Auth."
            label="Sincronizar"
            busy={admin.busy === 'sync'}
            onRun={admin.actions.syncUsers}
          />
          <Job
            icon={<UserRoundSearch className="h-5 w-5" />}
            title="Reconstruir perfis públicos"
            description="Regrava nome e foto usados na busca de amigos a partir das fichas de usuário. Use se alguém não aparece na busca."
            label="Reconstruir"
            busy={admin.busy === 'maintenance-profiles'}
            onRun={() => admin.actions.runMaintenance('profiles')}
          />
          <Job
            icon={<MessagesSquare className="h-5 w-5" />}
            title="Corrigir participantes de chats"
            description="Preenche a lista de participantes em conversas antigas. Use se uma conversa não aparece para os dois jogadores."
            label="Corrigir"
            busy={admin.busy === 'maintenance-chats'}
            onRun={() => admin.actions.runMaintenance('chats')}
          />
        </div>
      </Panel>

      {admin.mode === 'demo' && (
        <Panel
          title="Dados de demonstração"
          description="Volta o modo demo ao estado inicial, desfazendo tudo que foi alterado localmente."
        >
          <Button variant="secondary" size="sm" onClick={admin.actions.resetDevData}>
            <RotateCcw className="h-4 w-4" />
            Restaurar dados de demonstração
          </Button>
        </Panel>
      )}
    </div>
  );
}
