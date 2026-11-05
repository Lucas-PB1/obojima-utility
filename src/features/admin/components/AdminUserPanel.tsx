'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Boxes,
  Coins,
  Copy,
  FlaskConical,
  Gift,
  History,
  Loader2,
  LogOut,
  ScrollText,
  ShieldAlert,
  Trash2,
  UserCog,
  Users
} from 'lucide-react';
import { UserProfile } from '@/types/auth';
import { Button, Modal, UserAvatar } from '@/components/ui';
import type { AdminDashboardModel } from '../hooks/useAdminDashboard';
import { AdminItemType, AdminUserDetails } from '../types';
import { AdminAuditList } from './AdminAuditList';
import { AdminGrantForm } from './AdminGrantForm';
import {
  ConfirmDialog,
  EmptyPanel,
  formatDateTime,
  formatRelativeTime,
  Panel,
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  RoleBadge,
  StatusBadge
} from './adminUi';

type Tab = 'profile' | 'inventory' | 'potions' | 'history' | 'social' | 'moderation' | 'log';

const inputClass =
  'w-full rounded-lg bg-[var(--input-bg)] px-3 py-2.5 text-sm font-medium text-foreground shadow-[inset_0_0_0_1px_var(--hairline)] outline-none focus:ring-4 focus:ring-totoro-blue/15 disabled:opacity-60';

function ProfileTab({ details, admin }: { details: AdminUserDetails; admin: AdminDashboardModel }) {
  const isSelf = details.user.uid === admin.currentUid;
  const [displayName, setDisplayName] = useState(details.user.displayName || '');
  const [role, setRole] = useState(details.user.role);
  const [gold, setGold] = useState(details.gold || 0);

  useEffect(() => {
    setDisplayName(details.user.displayName || '');
    setRole(details.user.role);
    setGold(details.gold || 0);
  }, [details]);

  const safeGold = Math.max(0, Math.floor(gold) || 0);
  const dirty =
    displayName.trim() !== (details.user.displayName || '') ||
    role !== details.user.role ||
    safeGold !== (details.gold || 0);

  const save = () => {
    const updates: Partial<UserProfile> & { gold?: number } = {};
    if (displayName.trim() !== (details.user.displayName || ''))
      updates.displayName = displayName.trim();
    if (role !== details.user.role) updates.role = role;
    if (safeGold !== (details.gold || 0)) updates.gold = safeGold;
    void admin.actions.saveProfile(details.user.uid, updates);
  };

  const copyUid = () => {
    void navigator.clipboard?.writeText(details.user.uid);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Panel title="Dados do jogador">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="block text-xs font-bold text-foreground/60">Nome de exibição</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={60}
              className={inputClass}
            />
          </label>
          <label className="space-y-1.5">
            <span className="block text-xs font-bold text-foreground/60">Função</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserProfile['role'])}
              disabled={isSelf}
              className={inputClass}
            >
              <option value="user">Jogador</option>
              <option value="admin">Admin</option>
            </select>
            {isSelf && (
              <span className="block text-[11px] text-foreground/50">
                Você não pode remover o próprio acesso de admin.
              </span>
            )}
          </label>
          <div className="space-y-1.5 sm:col-span-2">
            <span className="block text-xs font-bold text-foreground/60">Gold</span>
            <div className="flex flex-wrap items-center gap-2">
              {[-100, -10].map((delta) => (
                <Button
                  key={delta}
                  size="sm"
                  variant="secondary"
                  onClick={() => setGold((value) => Math.max(0, value + delta))}
                >
                  {delta}
                </Button>
              ))}
              <input
                type="number"
                min={0}
                value={gold}
                onChange={(event) => setGold(Number(event.target.value))}
                aria-label="Gold"
                className={`${inputClass} w-32 text-center font-black`}
              />
              {[10, 100].map((delta) => (
                <Button
                  key={delta}
                  size="sm"
                  variant="secondary"
                  onClick={() => setGold((value) => value + delta)}
                >
                  +{delta}
                </Button>
              ))}
              {safeGold !== (details.gold || 0) && (
                <span className="text-xs font-bold text-totoro-orange">
                  antes: {details.gold || 0}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--hairline)] pt-4">
          <Button
            size="sm"
            onClick={save}
            disabled={!dirty || !displayName.trim() || admin.busy === 'profile'}
          >
            <UserCog className="h-4 w-4" />
            {admin.busy === 'profile' ? 'Salvando...' : 'Salvar alterações'}
          </Button>
          {dirty && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDisplayName(details.user.displayName || '');
                setRole(details.user.role);
                setGold(details.gold || 0);
              }}
            >
              Descartar
            </Button>
          )}
          {dirty && (
            <span className="text-xs font-bold text-totoro-orange">Alterações não salvas</span>
          )}
        </div>
      </Panel>

      <Panel title="Identidade">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs font-bold text-foreground/50">UID</dt>
            <dd className="mt-1 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded bg-[var(--surface-muted)] px-2 py-1 text-xs">
                {details.user.uid}
              </code>
              <button
                type="button"
                onClick={copyUid}
                aria-label="Copiar UID"
                title="Copiar UID"
                className="rounded p-1 text-foreground/50 hover:bg-foreground/10"
              >
                <Copy className="h-4 w-4" />
              </button>
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-foreground/55">Email</dt>
            <dd className="truncate font-bold">{details.user.email || '—'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-foreground/55">Criado</dt>
            <dd className="font-bold">{formatDateTime(details.user.createdAt, false)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-foreground/55">Último acesso</dt>
            <dd className="font-bold" title={formatDateTime(details.user.lastLogin)}>
              {formatRelativeTime(details.user.lastLogin)}
            </dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}

function QuantityEditor({
  value,
  busy,
  onCommit,
  onDelete
}: {
  value: number;
  busy: boolean;
  onCommit: (next: number) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const commit = (next: number) => {
    const safe = Math.max(1, Math.floor(next) || 1);
    if (safe !== value) onCommit(safe);
    else setDraft(String(value));
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="flex overflow-hidden rounded-lg bg-[var(--surface-muted)] ring-1 ring-inset ring-[var(--hairline)]">
        <button
          type="button"
          disabled={busy || value <= 1}
          onClick={() => commit(value - 1)}
          aria-label="Diminuir"
          className="px-3 py-1.5 text-sm font-black transition hover:bg-[var(--surface-hover)] disabled:opacity-40"
        >
          −
        </button>
        <input
          value={draft}
          inputMode="numeric"
          disabled={busy}
          onChange={(event) => setDraft(event.target.value.replace(/\D/g, ''))}
          onBlur={() => commit(Number(draft))}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit(Number(draft));
            if (event.key === 'Escape') setDraft(String(value));
          }}
          aria-label="Quantidade"
          className="w-12 bg-transparent text-center text-sm font-black outline-none"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => commit(value + 1)}
          aria-label="Aumentar"
          className="px-3 py-1.5 text-sm font-black transition hover:bg-[var(--surface-hover)] disabled:opacity-40"
        >
          +
        </button>
      </div>
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin text-totoro-blue" />
      ) : (
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-2 text-totoro-orange transition hover:bg-totoro-orange/10"
          aria-label="Remover item"
          title="Remover item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function InventoryTab({
  details,
  admin,
  type
}: {
  details: AdminUserDetails;
  admin: AdminDashboardModel;
  type: AdminItemType;
}) {
  const [showGrant, setShowGrant] = useState(false);
  const [term, setTerm] = useState('');
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);
  const uid = details.user.uid;

  const rows = useMemo(() => {
    const items =
      type === 'ingredient'
        ? details.ingredients.map((item) => ({
            id: item.id,
            name: item.ingredient?.nome || 'Ingrediente',
            meta: `${item.ingredient?.raridade || 'sem raridade'}${item.used ? ' · usado' : ''}`,
            date: item.collectedAt,
            quantity: item.quantity
          }))
        : details.potions.map((potion) => ({
            id: potion.id,
            name: potion.potion?.nome || potion.recipe?.resultingPotion?.nome || 'Poção',
            meta: `${potion.recipe?.winningAttribute || 'sem categoria'}${potion.used ? ' · usada' : ''}`,
            date: potion.createdAt,
            quantity: potion.quantity
          }));
    const value = term.trim().toLowerCase();
    return value ? items.filter((item) => item.name.toLowerCase().includes(value)) : items;
  }, [details, type, term]);

  const total = rows.reduce((sum, row) => sum + (row.quantity || 0), 0);
  const label = type === 'ingredient' ? 'ingredientes' : 'poções';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={`Filtrar ${label}`}
          aria-label={`Filtrar ${label}`}
          className={`${inputClass} max-w-xs`}
        />
        <span className="text-xs font-bold text-foreground/55">
          {rows.length} entradas · {total} unidades
        </span>
        <Button
          size="sm"
          className="ml-auto"
          variant={showGrant ? 'secondary' : 'primary'}
          onClick={() => setShowGrant((value) => !value)}
        >
          <Gift className="h-4 w-4" />
          {showGrant ? 'Fechar' : type === 'ingredient' ? 'Conceder ingrediente' : 'Conceder poção'}
        </Button>
      </div>

      {showGrant && (
        <Panel title={type === 'ingredient' ? 'Conceder ingrediente' : 'Conceder poção'}>
          <AdminGrantForm
            type={type}
            busy={admin.busy === 'grant'}
            onGrant={(payload) => admin.actions.grantItem(uid, payload)}
          />
        </Panel>
      )}

      {rows.length === 0 ? (
        <EmptyPanel
          label={
            term ? 'Nada corresponde ao filtro.' : `Nenhum(a) ${label.slice(0, -1)} no inventário.`
          }
        />
      ) : (
        <ul className="divide-y divide-[var(--hairline)] rounded-lg ring-1 ring-inset ring-[var(--hairline)]">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-col justify-between gap-3 p-3 sm:flex-row sm:items-center"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-foreground">{row.name}</p>
                <p className="text-xs text-foreground/55">
                  {row.meta} · {formatDateTime(row.date, false)}
                </p>
              </div>
              <QuantityEditor
                value={row.quantity}
                busy={admin.busy === `item-${row.id}`}
                onCommit={(next) => admin.actions.setItemQuantity(uid, type, row.id, next)}
                onDelete={() => setToDelete({ id: row.id, name: row.name })}
              />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Remover item"
        description={
          <>
            Remover <strong>{toDelete?.name}</strong> do inventário de{' '}
            {details.user.displayName || details.user.email}? Esta ação não pode ser desfeita.
          </>
        }
        confirmLabel="Remover"
        busy={!!toDelete && admin.busy === `item-${toDelete.id}`}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          const ok = await admin.actions.deleteItem(uid, type, toDelete.id);
          if (ok) setToDelete(null);
        }}
      />
    </div>
  );
}

function HistoryTab({ details }: { details: AdminUserDetails }) {
  const successes = details.history.filter((attempt) => attempt.success).length;
  if (details.history.length === 0) return <EmptyPanel label="Nenhum forrageamento registrado." />;
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-foreground/55">
        Últimas {details.history.length} tentativas · {successes} sucessos (
        {Math.round((successes / details.history.length) * 100)}%)
      </p>
      <ul className="divide-y divide-[var(--hairline)] rounded-lg ring-1 ring-inset ring-[var(--hairline)]">
        {details.history.map((attempt, index) => (
          <li
            key={attempt.id || index}
            className="grid gap-1 p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-4"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-foreground">
                {attempt.ingredient?.nome || (attempt.success ? 'Sucesso' : 'Nada encontrado')}
              </p>
              <p className="text-xs text-foreground/55">
                {attempt.region} · {formatDateTime(attempt.timestamp)}
              </p>
            </div>
            <span className="text-xs font-bold text-foreground/70">
              Rolagem {attempt.roll} vs CD {attempt.dc}
            </span>
            <span
              className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${
                attempt.success
                  ? 'bg-totoro-green/10 text-totoro-green'
                  : 'bg-totoro-orange/10 text-totoro-orange'
              }`}
            >
              {attempt.success ? 'Sucesso' : 'Falha'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialTab({ details, admin }: { details: AdminUserDetails; admin: AdminDashboardModel }) {
  const { social } = details;
  const groups: Array<[string, number]> = [
    ['Amigos', social.friends.length],
    ['Solicitações recebidas', social.incomingRequests.length],
    ['Solicitações enviadas', social.outgoingRequests.length],
    ['Conversas', social.conversations.length],
    ['Bloqueios', social.blockedUsers.length],
    ['Trocas', social.trades.length]
  ];
  const reportsAbout = social.reports.filter(
    (report) => report.reportedUserId === details.user.uid
  );
  const reportsBy = social.reports.filter((report) => report.reporterId === details.user.uid);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {groups.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-[var(--surface-muted)] p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-foreground/55">
              {label}
            </p>
            <p className="mt-1 text-2xl font-black text-foreground">{value}</p>
          </div>
        ))}
      </div>
      <Panel
        title={`Denúncias contra este jogador (${reportsAbout.length})`}
        description={`Feitas por ele: ${reportsBy.length}`}
      >
        {reportsAbout.length === 0 ? (
          <EmptyPanel label="Nenhuma denúncia contra este jogador." />
        ) : (
          <ul className="space-y-2">
            {reportsAbout.map((report) => (
              <li key={report.id} className="rounded-lg bg-[var(--surface-muted)] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-black">
                    {REPORT_REASON_LABELS[report.reason] || report.reason}
                  </span>
                  <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-[10px] font-black uppercase">
                    {REPORT_STATUS_LABELS[report.status]}
                  </span>
                  <span className="ml-auto text-xs text-foreground/50">
                    {formatRelativeTime(report.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-foreground/65">
                  {report.details || 'Sem detalhes'}
                </p>
                {report.status === 'open' && (
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      disabled={admin.busy === `report-${report.id}`}
                      onClick={() => admin.actions.setReportStatus(report.id, 'reviewed')}
                    >
                      Revisada
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={admin.busy === `report-${report.id}`}
                      onClick={() => admin.actions.setReportStatus(report.id, 'dismissed')}
                    >
                      Dispensar
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function ModerationTab({
  details,
  admin
}: {
  details: AdminUserDetails;
  admin: AdminDashboardModel;
}) {
  const { user } = details;
  const isSelf = user.uid === admin.currentUid;
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [confirm, setConfirm] = useState<'disable' | 'sessions' | 'delete' | null>(null);
  const deletePhrase = user.email || user.displayName || user.uid;

  return (
    <div className="space-y-4">
      <Panel
        title="Enviar notificação"
        description="Aparece nas notificações do jogador (e como push, se ele ativou)."
      >
        <div className="space-y-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Título (ex.: Aviso da moderação)"
            maxLength={80}
            aria-label="Título da notificação"
            className={inputClass}
          />
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Mensagem"
            maxLength={500}
            aria-label="Mensagem da notificação"
            className={`${inputClass} min-h-20`}
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-foreground/45">{message.length}/500</span>
            <Button
              size="sm"
              disabled={!title.trim() || !message.trim() || admin.busy === 'notify'}
              onClick={async () => {
                const ok = await admin.actions.notifyUser(user.uid, title.trim(), message.trim());
                if (ok) {
                  setTitle('');
                  setMessage('');
                }
              }}
            >
              <Bell className="h-4 w-4" />
              {admin.busy === 'notify' ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </div>
      </Panel>

      <Panel title="Acesso à conta">
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold">Encerrar sessões</p>
              <p className="text-xs text-foreground/55">
                Desconecta o jogador em todos os dispositivos. Ele pode entrar de novo.
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setConfirm('sessions')}>
              <LogOut className="h-4 w-4" />
              Encerrar sessões
            </Button>
          </div>
          <div className="flex flex-col gap-2 border-t border-[var(--hairline)] pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold">
                {user.disabled ? 'Conta desativada' : 'Desativar conta'}
              </p>
              <p className="text-xs text-foreground/55">
                {user.disabled
                  ? 'O jogador não consegue entrar. Reative para liberar o acesso.'
                  : 'Bloqueia o login e encerra as sessões. Reversível.'}
              </p>
            </div>
            {user.disabled ? (
              <Button
                size="sm"
                variant="success"
                disabled={admin.busy === 'disable'}
                onClick={() => admin.actions.setDisabled(user.uid, false)}
              >
                Reativar conta
              </Button>
            ) : (
              <Button
                size="sm"
                variant="danger"
                disabled={isSelf}
                onClick={() => setConfirm('disable')}
                title={isSelf ? 'Você não pode desativar a própria conta' : undefined}
              >
                <ShieldAlert className="h-4 w-4" />
                Desativar
              </Button>
            )}
          </div>
        </div>
      </Panel>

      <section className="rounded-lg border border-totoro-orange/30 bg-totoro-orange/8 p-4">
        <p className="text-sm font-black text-foreground">Excluir conta</p>
        <p className="mt-1 text-xs text-foreground/65">
          Apaga a conta do Auth, inventário, histórico, notificações, perfil público, amizades,
          solicitações, bloqueios e conversas. Denúncias e trocas ficam no histórico.{' '}
          <strong>Não pode ser desfeito.</strong>
        </p>
        <Button
          size="sm"
          variant="danger"
          className="mt-3"
          disabled={isSelf}
          onClick={() => setConfirm('delete')}
        >
          <Trash2 className="h-4 w-4" />
          {isSelf ? 'Você não pode excluir a própria conta' : 'Excluir conta'}
        </Button>
      </section>

      <ConfirmDialog
        open={confirm === 'sessions'}
        title="Encerrar sessões"
        description={
          <>
            Desconectar <strong>{user.displayName || user.email}</strong> de todos os dispositivos?
          </>
        }
        confirmLabel="Encerrar sessões"
        busy={admin.busy === 'sessions'}
        onClose={() => setConfirm(null)}
        onConfirm={async () => {
          if (await admin.actions.revokeSessions(user.uid)) setConfirm(null);
        }}
      />
      <ConfirmDialog
        open={confirm === 'disable'}
        title="Desativar conta"
        description={
          <>
            A conta de <strong>{user.displayName || user.email}</strong> será bloqueada e todas as
            sessões encerradas.
          </>
        }
        confirmLabel="Desativar"
        busy={admin.busy === 'disable'}
        onClose={() => setConfirm(null)}
        onConfirm={async () => {
          if (await admin.actions.setDisabled(user.uid, true)) setConfirm(null);
        }}
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        title="Excluir conta permanentemente"
        description={
          <>
            Todos os dados de <strong>{user.displayName || user.email}</strong> serão apagados.
          </>
        }
        confirmLabel="Excluir para sempre"
        confirmPhrase={deletePhrase}
        busy={admin.busy === 'delete'}
        onClose={() => setConfirm(null)}
        onConfirm={async () => {
          if (await admin.actions.deleteUser(user.uid)) setConfirm(null);
        }}
      />
    </div>
  );
}

export function AdminUserPanel({ admin }: { admin: AdminDashboardModel }) {
  const { details, detailsLoading, openUid } = admin;
  const [tab, setTab] = useState<Tab>('profile');

  useEffect(() => {
    if (openUid) setTab('profile');
  }, [openUid]);

  const openReports = details?.social.reports.filter(
    (report) => report.status === 'open' && report.reportedUserId === details.user.uid
  ).length;

  const tabs: Array<[Tab, typeof UserCog, string, number?]> = [
    ['profile', UserCog, 'Perfil'],
    ['inventory', Boxes, 'Ingredientes', details?.ingredients.length],
    ['potions', FlaskConical, 'Poções', details?.potions.length],
    ['history', History, 'Histórico'],
    ['social', Users, 'Social', openReports || undefined],
    ['moderation', ShieldAlert, 'Moderação'],
    ['log', ScrollText, 'Registro', details?.adminLog?.length]
  ];

  return (
    <Modal
      isOpen={!!openUid}
      onClose={admin.closeUser}
      title={details?.user.displayName || details?.user.email || 'Ficha do jogador'}
      size="3xl"
    >
      <div className="flex h-[min(82vh,760px)] flex-col gap-4 overflow-hidden">
        {!details ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-totoro-blue" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 rounded-lg bg-[var(--surface-muted)] p-3">
              <UserAvatar
                src={details.user.photoURL}
                name={details.user.displayName}
                email={details.user.email}
                className="h-12 w-12 border border-[var(--hairline)]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-base font-black text-foreground">
                    {details.user.displayName || 'Sem nome'}
                  </p>
                  <RoleBadge role={details.user.role} />
                  <StatusBadge user={details.user} />
                  {detailsLoading && <Loader2 className="h-4 w-4 animate-spin text-totoro-blue" />}
                </div>
                <p className="truncate text-xs text-foreground/55">
                  {details.user.email || details.user.uid}
                </p>
              </div>
              <div className="flex gap-4 text-center">
                <div>
                  <p className="flex items-center gap-1 text-sm font-black text-totoro-orange">
                    <Coins className="h-4 w-4" />
                    {details.gold}
                  </p>
                  <p className="text-[10px] font-bold uppercase text-foreground/45">Gold</p>
                </div>
                <div>
                  <p className="text-sm font-black">{details.social.friends.length}</p>
                  <p className="text-[10px] font-bold uppercase text-foreground/45">Amigos</p>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar" role="tablist">
              {tabs.map(([id, Icon, label, count]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wide transition focus:outline-none focus-visible:ring-4 focus-visible:ring-totoro-blue/15 ${
                    tab === id
                      ? 'bg-totoro-blue text-white'
                      : 'bg-[var(--surface-muted)] text-foreground/65 hover:bg-[var(--surface-hover)] hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {count !== undefined && count > 0 && (
                    <span
                      className={`rounded-full px-1.5 text-[10px] ${
                        tab === id
                          ? 'bg-white/25'
                          : id === 'social'
                            ? 'bg-totoro-orange text-white'
                            : 'bg-foreground/10'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1" role="tabpanel">
              {tab === 'profile' && <ProfileTab details={details} admin={admin} />}
              {tab === 'inventory' && (
                <InventoryTab details={details} admin={admin} type="ingredient" />
              )}
              {tab === 'potions' && <InventoryTab details={details} admin={admin} type="potion" />}
              {tab === 'history' && <HistoryTab details={details} />}
              {tab === 'social' && <SocialTab details={details} admin={admin} />}
              {tab === 'moderation' && <ModerationTab details={details} admin={admin} />}
              {tab === 'log' && (
                <AdminAuditList entries={details.adminLog || []} showTarget={false} />
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
