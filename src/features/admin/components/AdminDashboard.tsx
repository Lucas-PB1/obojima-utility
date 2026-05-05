'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Coins,
  FlaskConical,
  History,
  KeyRound,
  Loader2,
  Moon,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCog,
  Users,
  X
} from 'lucide-react';
import { UserProfile } from '@/types/auth';
import { Button, Input, Modal, Select, UserAvatar } from '@/components/ui';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { AdminUserDetails } from '../types';
import { getAdminStatusLabel, getAdminUserStatus } from '../domain/adminRules';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

type AdminTab = 'profile' | 'inventory' | 'potions' | 'history' | 'social' | 'security' | 'audit';

function formatDate(value?: string | Date | null): string {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
}

function StatusBadge({ user }: { user: UserProfile }) {
  const status = getAdminUserStatus(user);
  const classes = {
    active: 'bg-totoro-green/12 text-totoro-green ring-totoro-green/25',
    disabled: 'bg-totoro-orange/12 text-totoro-orange ring-totoro-orange/25',
    orphaned: 'bg-foreground/8 text-foreground/60 ring-foreground/15'
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ring-inset ${classes[status]}`}
    >
      {getAdminStatusLabel(status)}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'blue'
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'blue' | 'green' | 'orange' | 'gray';
}) {
  const toneClass = {
    blue: 'text-totoro-blue bg-totoro-blue/10',
    green: 'text-totoro-green bg-totoro-green/10',
    orange: 'text-totoro-orange bg-totoro-orange/10',
    gray: 'text-foreground/70 bg-foreground/8'
  };
  return (
    <div className="surface-raised rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-foreground/55">{label}</p>
          <p className="mt-1 text-2xl font-black text-foreground">{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${toneClass[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function UserRow({ user, onOpen }: { user: UserProfile; onOpen: (user: UserProfile) => void }) {
  return (
    <button
      onClick={() => onOpen(user)}
      className="group flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-[var(--surface-hover)] focus:outline-none focus:ring-4 focus:ring-totoro-blue/15"
    >
      <UserAvatar
        src={user.photoURL}
        name={user.displayName}
        email={user.email}
        className="h-11 w-11 shrink-0 border border-[var(--hairline)] text-sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-black text-foreground">
            {user.displayName || 'Sem nome'}
          </span>
          <span className="rounded-full bg-totoro-blue/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-totoro-blue">
            {user.role}
          </span>
        </div>
        <p className="truncate text-xs font-medium text-foreground/55">{user.email || user.uid}</p>
      </div>
      <div className="hidden sm:block">
        <StatusBadge user={user} />
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-foreground/35 transition group-hover:text-totoro-blue" />
    </button>
  );
}

function EmptyPanel({ label }: { label: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-[var(--hairline-strong)] bg-[var(--surface-muted)] p-6 text-center text-sm font-medium text-foreground/55">
      {label}
    </div>
  );
}

function MiniTable<T>({
  rows,
  empty,
  render
}: {
  rows: T[];
  empty: string;
  render: (row: T, index: number) => React.ReactNode;
}) {
  if (rows.length === 0) return <EmptyPanel label={empty} />;
  return <div className="divide-y divide-[var(--hairline)] rounded-lg">{rows.map(render)}</div>;
}

function ProfileTab({
  details,
  onUpdate,
  onGoldUpdate
}: {
  details: AdminUserDetails;
  onUpdate: (uid: string, updates: Partial<UserProfile>) => Promise<void>;
  onGoldUpdate: (uid: string, gold: number) => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState(details.user.displayName || '');
  const [role, setRole] = useState(details.user.role);
  const [gold, setGold] = useState(String(details.gold || 0));
  const safeGold = Math.max(0, Math.floor(Number(gold) || 0));

  useEffect(() => {
    setDisplayName(details.user.displayName || '');
    setRole(details.user.role);
    setGold(String(details.gold || 0));
  }, [details.gold, details.user]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="surface-raised rounded-lg p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nome"
            value={displayName}
            onChange={(value) => setDisplayName(String(value))}
          />
          <Select
            label="Função"
            value={role}
            onChange={(value) => setRole(value as UserProfile['role'])}
            options={[
              { value: 'user', label: 'Usuário' },
              { value: 'admin', label: 'Admin' }
            ]}
          />
          <Input
            label="Gold"
            type="number"
            min={0}
            value={gold}
            onChange={(value) => setGold(String(value))}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={async () => {
              await onUpdate(details.user.uid, { displayName, role });
              await onGoldUpdate(details.user.uid, safeGold);
            }}
            disabled={!displayName.trim()}
          >
            <UserCog className="h-4 w-4" />
            Salvar perfil
          </Button>
          <Button
            size="sm"
            variant={details.user.disabled ? 'success' : 'danger'}
            onClick={() => onUpdate(details.user.uid, { disabled: !details.user.disabled })}
          >
            <Shield className="h-4 w-4" />
            {details.user.disabled ? 'Reativar conta' : 'Desativar conta'}
          </Button>
        </div>
      </div>
      <div className="surface-raised rounded-lg p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-foreground/55">Identidade</p>
        <code className="mt-2 block break-all rounded-lg bg-[var(--surface-muted)] p-3 text-xs text-foreground/75">
          {details.user.uid}
        </code>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-foreground/55">Gold</span>
            <span className="inline-flex items-center gap-1 font-black text-totoro-orange">
              <Coins className="h-4 w-4" />
              {safeGold}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-foreground/55">Email</span>
            <span className="truncate font-bold">{details.user.email || '-'}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-foreground/55">Status</span>
            <StatusBadge user={details.user} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuantityActions({
  value,
  disabled,
  onChange,
  onDelete
}: {
  value: number;
  disabled: boolean;
  onChange: (next: number) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="flex overflow-hidden rounded-lg bg-[var(--surface-muted)] ring-1 ring-inset ring-[var(--hairline)]">
        <button
          disabled={disabled}
          onClick={() => onChange(value - 1)}
          className="px-3 py-1.5 text-sm font-black text-foreground transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          -
        </button>
        <span className="min-w-10 px-2 py-1.5 text-center text-sm font-black text-foreground">
          {value}
        </span>
        <button
          disabled={disabled}
          onClick={() => onChange(value + 1)}
          className="px-3 py-1.5 text-sm font-black text-foreground transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          +
        </button>
      </div>
      <button
        disabled={disabled}
        onClick={onDelete}
        className="rounded-lg p-2 text-totoro-orange transition hover:bg-totoro-orange/10 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Remover item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function InventoryTab({
  details,
  mode,
  onQuantityChange,
  onDelete
}: {
  details: AdminUserDetails;
  mode: 'live' | 'demo';
  onQuantityChange: (itemId: string, quantity: number) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
}) {
  return (
    <div className="space-y-3">
      {mode === 'demo' && <EmptyPanel label="Modo demo: edição real de inventário bloqueada." />}
      <MiniTable
        rows={details.ingredients}
        empty="Nenhum ingrediente encontrado para este cliente."
        render={(item, index) => (
          <div
            key={item.id || index}
            className="flex flex-col justify-between gap-3 p-3 sm:flex-row sm:items-center"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-foreground">
                {item.ingredient?.nome || 'Ingrediente'}
              </p>
              <p className="text-xs text-foreground/55">
                {item.ingredient?.raridade || 'sem raridade'} · adquirido{' '}
                {formatDate(item.collectedAt)}
              </p>
            </div>
            <QuantityActions
              value={item.quantity}
              disabled={mode === 'demo'}
              onChange={(next) => onQuantityChange(item.id, next)}
              onDelete={() => onDelete(item.id)}
            />
          </div>
        )}
      />
    </div>
  );
}

function PotionsTab({
  details,
  mode,
  onQuantityChange,
  onDelete
}: {
  details: AdminUserDetails;
  mode: 'live' | 'demo';
  onQuantityChange: (potionId: string, current: number, change: number) => Promise<void>;
  onDelete: (potionId: string) => Promise<void>;
}) {
  return (
    <div className="space-y-3">
      {mode === 'demo' && <EmptyPanel label="Modo demo: edição real de poções bloqueada." />}
      <MiniTable
        rows={details.potions}
        empty="Nenhuma poção encontrada para este cliente."
        render={(potion, index) => (
          <div
            key={potion.id || index}
            className="flex flex-col justify-between gap-3 p-3 sm:flex-row sm:items-center"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-foreground">
                {potion.recipe?.resultingPotion?.nome || potion.potion?.nome || 'Poção'}
              </p>
              <p className="text-xs text-foreground/55">
                {potion.recipe?.winningAttribute || 'sem categoria'} · criada{' '}
                {formatDate(potion.createdAt)}
              </p>
            </div>
            <QuantityActions
              value={potion.quantity}
              disabled={mode === 'demo'}
              onChange={(next) =>
                onQuantityChange(potion.id, potion.quantity, next - potion.quantity)
              }
              onDelete={() => onDelete(potion.id)}
            />
          </div>
        )}
      />
    </div>
  );
}

function HistoryTab({ details }: { details: AdminUserDetails }) {
  return (
    <MiniTable
      rows={details.history}
      empty="Nenhum histórico de forrageamento encontrado."
      render={(attempt, index) => (
        <div
          key={attempt.id || index}
          className="grid gap-2 p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center"
        >
          <div>
            <p className="text-sm font-black text-foreground">{attempt.region}</p>
            <p className="text-xs text-foreground/55">{formatDate(attempt.timestamp)}</p>
          </div>
          <span className="text-sm font-bold text-foreground/75">Rolagem {attempt.roll}</span>
          <span
            className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${
              attempt.success
                ? 'bg-totoro-green/10 text-totoro-green'
                : 'bg-totoro-orange/10 text-totoro-orange'
            }`}
          >
            {attempt.success ? 'Sucesso' : 'Falha'}
          </span>
        </div>
      )}
    />
  );
}

function SocialTab({
  details,
  onReportStatusChange
}: {
  details: AdminUserDetails;
  onReportStatusChange: (
    reportId: string,
    status: 'open' | 'reviewed' | 'dismissed'
  ) => Promise<void>;
}) {
  const groups = [
    ['Amigos', details.social.friends.length],
    ['Chats', details.social.conversations.length],
    ['Bloqueios', details.social.blockedUsers.length],
    ['Denúncias', details.social.reports.length],
    ['Notificações', details.social.notifications.length],
    ['Trocas', details.social.trades.length]
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {groups.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-[var(--surface-muted)] p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-foreground/55">{label}</p>
            <p className="mt-1 text-2xl font-black text-foreground">{value}</p>
          </div>
        ))}
      </div>
      <MiniTable
        rows={details.social.reports}
        empty="Nenhuma denúncia relacionada a este cliente."
        render={(report) => (
          <div key={report.id} className="p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black text-foreground">{report.reason}</p>
                  <span className="rounded-full bg-totoro-orange/10 px-2 py-0.5 text-[10px] font-black uppercase text-totoro-orange">
                    {report.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-foreground/60">
                  {report.details || 'Sem detalhes'}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onReportStatusChange(report.id, 'reviewed')}
                  disabled={report.status === 'reviewed'}
                >
                  Revisar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onReportStatusChange(report.id, 'dismissed')}
                  disabled={report.status === 'dismissed'}
                >
                  Dispensar
                </Button>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}

function SecurityTab({
  details,
  mode,
  onDelete
}: {
  details: AdminUserDetails;
  mode: 'live' | 'demo';
  onDelete: (uid: string) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-totoro-orange/25 bg-totoro-orange/10 p-4 text-sm text-foreground">
        <p className="font-black">Zona sensível</p>
        <p className="mt-1 text-foreground/65">
          Exclusão remove a conta do Auth quando possível e limpa o documento principal do
          Firestore.
          {mode === 'demo' ? ' No modo demo, esta ação é bloqueada.' : ''}
        </p>
      </div>
      {!confirming ? (
        <Button variant="danger" onClick={() => setConfirming(true)}>
          <Trash2 className="h-4 w-4" />
          Preparar exclusão
        </Button>
      ) : (
        <div className="surface-raised rounded-lg p-4">
          <p className="text-sm font-bold text-foreground">
            Confirmar exclusão de{' '}
            {details.user.displayName || details.user.email || details.user.uid}?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="danger" size="sm" onClick={() => onDelete(details.user.uid)}>
              Confirmar exclusão
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditTab({ details }: { details: AdminUserDetails }) {
  return (
    <MiniTable
      rows={details.audit}
      empty="Nenhuma informação de auditoria."
      render={(item) => (
        <div key={item.id} className="grid gap-1 p-3 sm:grid-cols-[180px_1fr]">
          <span className="text-xs font-black uppercase tracking-wide text-foreground/50">
            {item.label}
          </span>
          <span className="break-all text-sm font-medium text-foreground">{item.value}</span>
        </div>
      )}
    />
  );
}

function DetailsModal({
  details,
  loading,
  mode,
  onClose,
  onUpdate,
  onGoldUpdate,
  onDelete,
  onReportStatusChange,
  onIngredientQuantityChange,
  onIngredientDelete,
  onPotionQuantityChange,
  onPotionDelete
}: {
  details: AdminUserDetails | null;
  loading: boolean;
  mode: 'live' | 'demo';
  onClose: () => void;
  onUpdate: (uid: string, updates: Partial<UserProfile>) => Promise<void>;
  onGoldUpdate: (uid: string, gold: number) => Promise<void>;
  onDelete: (uid: string) => Promise<void>;
  onReportStatusChange: (
    reportId: string,
    status: 'open' | 'reviewed' | 'dismissed'
  ) => Promise<void>;
  onIngredientQuantityChange: (itemId: string, quantity: number) => Promise<void>;
  onIngredientDelete: (itemId: string) => Promise<void>;
  onPotionQuantityChange: (potionId: string, current: number, change: number) => Promise<void>;
  onPotionDelete: (potionId: string) => Promise<void>;
}) {
  const [tab, setTab] = useState<AdminTab>('profile');
  const tabs = useMemo(
    () =>
      [
        ['profile', UserCog, 'Perfil'],
        ['inventory', Boxes, 'Inventário'],
        ['potions', FlaskConical, 'Poções'],
        ['history', History, 'Histórico'],
        ['social', Users, 'Social'],
        ['security', KeyRound, 'Segurança'],
        ['audit', Bell, 'Auditoria']
      ] as const,
    []
  );

  const detailsUserId = details?.user.uid;

  useEffect(() => {
    if (detailsUserId) setTab('profile');
  }, [detailsUserId]);

  return (
    <Modal
      isOpen={loading || Boolean(details)}
      onClose={onClose}
      title={details?.user.displayName || 'Detalhes do cliente'}
      size="3xl"
    >
      <div className="flex h-[82vh] flex-col gap-4 overflow-hidden">
        {loading || !details ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-totoro-blue" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 rounded-lg bg-[var(--surface-muted)] p-3">
              <UserAvatar
                src={details.user.photoURL}
                name={details.user.displayName}
                email={details.user.email}
                className="h-12 w-12 border border-[var(--hairline)]"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-black text-foreground">
                  {details.user.displayName || 'Sem nome'}
                </p>
                <p className="truncate text-xs font-medium text-foreground/55">
                  {details.user.email || details.user.uid}
                </p>
              </div>
              <StatusBadge user={details.user} />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {tabs.map(([id, Icon, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wide transition focus:outline-none focus:ring-4 focus:ring-totoro-blue/15 ${
                    tab === id
                      ? 'bg-totoro-blue text-white'
                      : 'bg-[var(--surface-muted)] text-foreground/65 hover:bg-[var(--surface-hover)] hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {tab === 'profile' && (
                <ProfileTab details={details} onUpdate={onUpdate} onGoldUpdate={onGoldUpdate} />
              )}
              {tab === 'inventory' && (
                <InventoryTab
                  details={details}
                  mode={mode}
                  onQuantityChange={onIngredientQuantityChange}
                  onDelete={onIngredientDelete}
                />
              )}
              {tab === 'potions' && (
                <PotionsTab
                  details={details}
                  mode={mode}
                  onQuantityChange={onPotionQuantityChange}
                  onDelete={onPotionDelete}
                />
              )}
              {tab === 'history' && <HistoryTab details={details} />}
              {tab === 'social' && (
                <SocialTab details={details} onReportStatusChange={onReportStatusChange} />
              )}
              {tab === 'security' && (
                <SecurityTab details={details} mode={mode} onDelete={onDelete} />
              )}
              {tab === 'audit' && <AuditTab details={details} />}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export function AdminDashboard() {
  const admin = useAdminDashboard();
  const stats = admin.dashboard.stats;

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-6 text-foreground md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-totoro-blue">
              <Shield className="h-4 w-4" />
              Admin
              {admin.mode === 'demo' && (
                <span className="rounded-full bg-totoro-orange/10 px-2 py-0.5 text-totoro-orange">
                  Demo local
                </span>
              )}
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
              Operação de clientes
            </h1>
            <p className="mt-1 max-w-2xl text-sm font-medium text-foreground/60">
              Suporte para contas, inventário, poções, histórico e sinais sociais.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ThemeToggle />
            <Button variant="secondary" onClick={admin.refresh} disabled={admin.loading}>
              <RefreshCw className={`h-4 w-4 ${admin.loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button onClick={admin.syncUsers} disabled={admin.loading || admin.mode === 'demo'}>
              <Users className="h-4 w-4" />
              Sincronizar
            </Button>
          </div>
        </header>

        {admin.mode === 'demo' && (
          <div className="flex flex-col gap-3 rounded-lg border border-totoro-orange/25 bg-totoro-orange/10 p-4 text-sm text-foreground sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0 text-totoro-orange" />
                <p className="font-black">Modo dev ativo</p>
              </div>
              <p className="mt-1 text-foreground/65">
                O app está usando dados locais persistidos para todas as áreas do sistema.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => admin.resetDevData()}>
              Resetar dados dev
            </Button>
          </div>
        )}

        {admin.error && (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-totoro-orange/25 bg-totoro-orange/10 p-4 text-sm">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-totoro-orange" />
              <p className="font-bold text-foreground">{admin.error}</p>
            </div>
            <button
              onClick={() => admin.setError(null)}
              className="rounded p-1 hover:bg-foreground/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard label="Usuários" value={stats.totalUsers} icon={Users} />
          <StatCard label="Admins" value={stats.admins} icon={Shield} tone="orange" />
          <StatCard label="Ativos" value={stats.active} icon={CheckCircle2} tone="green" />
          <StatCard label="Desativados" value={stats.disabled} icon={KeyRound} tone="orange" />
          <StatCard label="Órfãos" value={stats.orphaned} icon={Moon} tone="gray" />
          <StatCard label="Denúncias" value={stats.openReports} icon={Bell} tone="orange" />
        </section>

        <section className="surface-raised overflow-hidden rounded-lg">
          <div className="grid gap-3 p-4 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
              <input
                value={admin.query}
                onChange={(event) => admin.setQuery(event.target.value)}
                placeholder="Buscar por nome, email, UID ou função"
                className="w-full rounded-lg bg-[var(--input-bg)] py-3 pl-10 pr-3 text-sm font-medium text-foreground shadow-[inset_0_0_0_1px_var(--hairline)] outline-none transition focus:ring-4 focus:ring-totoro-blue/15"
              />
            </div>
            <select
              value={admin.statusFilter}
              onChange={(event) =>
                admin.setStatusFilter(event.target.value as typeof admin.statusFilter)
              }
              className="rounded-lg bg-[var(--input-bg)] px-3 py-3 text-sm font-bold text-foreground shadow-[inset_0_0_0_1px_var(--hairline)] outline-none focus:ring-4 focus:ring-totoro-blue/15"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="disabled">Desativados</option>
              <option value="orphaned">Órfãos</option>
            </select>
          </div>
          <div className="subtle-divider-top divide-y divide-[var(--hairline)] p-2">
            {admin.loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-totoro-blue" />
              </div>
            ) : admin.users.length === 0 ? (
              <EmptyPanel label="Nenhum usuário encontrado." />
            ) : (
              admin.users.map((user) => (
                <UserRow key={user.uid} user={user} onOpen={admin.openUser} />
              ))
            )}
          </div>
        </section>
      </div>

      <DetailsModal
        details={admin.details}
        loading={admin.detailsLoading}
        mode={admin.mode}
        onClose={admin.closeUser}
        onUpdate={admin.updateUser}
        onGoldUpdate={admin.updateUserGold}
        onDelete={admin.deleteUser}
        onReportStatusChange={admin.updateReportStatus}
        onIngredientQuantityChange={admin.updateIngredientQuantity}
        onIngredientDelete={admin.deleteIngredient}
        onPotionQuantityChange={admin.updatePotionQuantity}
        onPotionDelete={admin.deletePotion}
      />
    </div>
  );
}
