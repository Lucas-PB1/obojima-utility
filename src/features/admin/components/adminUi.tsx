'use client';
import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { UserProfile } from '@/types/auth';
import { ReportReason, UserReport } from '@/types/social';
import { Button, Modal } from '@/components/ui';
import { AdminAuditAction } from '../types';
import { getAdminStatusLabel, getAdminUserStatus } from '../domain/adminRules';
import type { AdminToast } from '../hooks/useAdminDashboard';

export function formatDateTime(value?: string | Date | null, withTime = true): string {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
  });
}

export function formatRelativeTime(value?: string | Date | null): string {
  if (!value) return 'nunca';
  const date = value instanceof Date ? value : new Date(value);
  const diff = date.getTime() - Date.now();
  if (Number.isNaN(diff)) return '—';
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  const minutes = Math.round(diff / 60000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(days, 'day');
  return formatDateTime(date, false);
}

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam',
  abuse: 'Abuso',
  harassment: 'Assédio',
  trade: 'Problema em troca',
  other: 'Outro'
};

export const REPORT_STATUS_LABELS: Record<UserReport['status'], string> = {
  open: 'Aberta',
  reviewed: 'Revisada',
  dismissed: 'Dispensada'
};

export const AUDIT_ACTION_LABELS: Record<AdminAuditAction, string> = {
  'user.update': 'Perfil',
  'user.role': 'Função',
  'user.disable': 'Desativação',
  'user.enable': 'Reativação',
  'user.gold': 'Gold',
  'user.delete': 'Exclusão',
  'user.sessions': 'Sessões',
  'user.notify': 'Notificação',
  'item.grant': 'Concessão',
  'item.update': 'Inventário',
  'item.delete': 'Inventário',
  'report.status': 'Denúncia',
  'users.sync': 'Sincronização',
  'maintenance.run': 'Manutenção'
};

const DANGER_ACTIONS: AdminAuditAction[] = ['user.delete', 'user.disable', 'user.role'];

export function auditTone(action: AdminAuditAction): string {
  if (DANGER_ACTIONS.includes(action)) return 'bg-totoro-orange/12 text-totoro-orange';
  if (action === 'item.grant' || action === 'user.enable')
    return 'bg-totoro-green/12 text-totoro-green';
  return 'bg-totoro-blue/10 text-totoro-blue';
}

export function StatusBadge({ user }: { user: Pick<UserProfile, 'disabled' | 'isAuthActive'> }) {
  const status = getAdminUserStatus(user);
  const classes = {
    active: 'bg-totoro-green/12 text-totoro-green ring-totoro-green/25',
    disabled: 'bg-totoro-orange/12 text-totoro-orange ring-totoro-orange/25',
    orphaned: 'bg-foreground/8 text-foreground/60 ring-foreground/15'
  };
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ring-inset ${classes[status]}`}
      title={
        status === 'orphaned'
          ? 'Existe no banco de dados, mas não no Firebase Auth (a pessoa não consegue entrar).'
          : undefined
      }
    >
      {getAdminStatusLabel(status)}
    </span>
  );
}

export function RoleBadge({ role }: { role: UserProfile['role'] }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
        role === 'admin'
          ? 'bg-totoro-yellow/20 text-totoro-orange'
          : 'bg-totoro-blue/10 text-totoro-blue'
      }`}
    >
      {role === 'admin' ? 'Admin' : 'Jogador'}
    </span>
  );
}

export function EmptyPanel({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--hairline-strong)] bg-[var(--surface-muted)] p-6 text-center text-sm font-medium text-foreground/55">
      {icon}
      {label}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className = ''
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface-raised rounded-lg ${className}`}>
      {(title || actions) && (
        <div className="flex flex-col gap-2 px-4 pt-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-black text-foreground">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-foreground/55">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

/** Confirmation for destructive actions; optionally requires typing a phrase. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmPhrase,
  busy,
  onConfirm,
  onClose
}: {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  confirmPhrase?: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [typed, setTyped] = React.useState('');
  React.useEffect(() => {
    if (!open) setTyped('');
  }, [open]);
  const matches = !confirmPhrase || typed.trim() === confirmPhrase;

  return (
    <Modal isOpen={open} onClose={busy ? () => {} : onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="text-sm text-foreground/75">{description}</div>
        {confirmPhrase && (
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-foreground/60">
              Digite <strong className="text-foreground">{confirmPhrase}</strong> para confirmar
            </span>
            <input
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoFocus
              className="w-full rounded-lg bg-[var(--input-bg)] px-3 py-2.5 text-sm shadow-[inset_0_0_0_1px_var(--hairline)] outline-none focus:ring-4 focus:ring-totoro-orange/15"
            />
          </label>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={!matches || busy}>
            {busy ? 'Aguarde...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function AdminToasts({
  toasts,
  onDismiss
}: {
  toasts: AdminToast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      className="pointer-events-none fixed inset-x-3 bottom-4 z-[70] mx-auto flex max-w-md flex-col gap-2 sm:left-auto sm:right-4 sm:mx-0"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg bg-modal-bg p-3 text-sm shadow-[var(--shadow-raised)] ring-1 ring-inset ${
              toast.tone === 'success' ? 'ring-totoro-green/40' : 'ring-totoro-orange/50'
            }`}
            role={toast.tone === 'error' ? 'alert' : 'status'}
          >
            {toast.tone === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-totoro-green" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-totoro-orange" />
            )}
            <p className="flex-1 font-semibold text-foreground">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Fechar aviso"
              className="rounded p-0.5 text-foreground/50 hover:bg-foreground/10"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
