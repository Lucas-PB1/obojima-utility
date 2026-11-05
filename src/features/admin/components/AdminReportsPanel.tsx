'use client';
import React, { useMemo, useState } from 'react';
import { Flag, ShieldBan } from 'lucide-react';
import { UserReport } from '@/types/social';
import { Button } from '@/components/ui';
import { AdminReportRow } from '../types';
import {
  ConfirmDialog,
  EmptyPanel,
  formatDateTime,
  formatRelativeTime,
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS
} from './adminUi';

type Filter = 'open' | 'reviewed' | 'dismissed' | 'all';

interface AdminReportsPanelProps {
  reports: AdminReportRow[];
  busy: string | null;
  compact?: boolean;
  onOpenUser: (uid: string) => void;
  onSetStatus: (reportId: string, status: UserReport['status'], note?: string) => Promise<boolean>;
  onDisableUser?: (uid: string) => Promise<boolean>;
}

const STATUS_STYLES: Record<UserReport['status'], string> = {
  open: 'bg-totoro-orange/12 text-totoro-orange',
  reviewed: 'bg-totoro-green/12 text-totoro-green',
  dismissed: 'bg-foreground/8 text-foreground/60'
};

function ReportCard({
  report,
  busy,
  onOpenUser,
  onSetStatus,
  onDisable
}: {
  report: AdminReportRow;
  busy: boolean;
  onOpenUser: (uid: string) => void;
  onSetStatus: AdminReportsPanelProps['onSetStatus'];
  onDisable?: () => void;
}) {
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);

  const resolve = async (status: UserReport['status']) => {
    const ok = await onSetStatus(report.id, status, note);
    if (ok) {
      setNote('');
      setShowNote(false);
    }
  };

  return (
    <article className="rounded-lg bg-[var(--surface-muted)] p-4 ring-1 ring-inset ring-[var(--hairline)]">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${STATUS_STYLES[report.status]}`}
        >
          {REPORT_STATUS_LABELS[report.status]}
        </span>
        <span className="rounded-full bg-totoro-blue/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-totoro-blue">
          {REPORT_REASON_LABELS[report.reason] || report.reason}
        </span>
        <time
          className="ml-auto text-xs text-foreground/50"
          dateTime={report.createdAt}
          title={formatDateTime(report.createdAt)}
        >
          {formatRelativeTime(report.createdAt)}
        </time>
      </div>

      <p className="mt-3 text-sm text-foreground">
        <button
          type="button"
          onClick={() => onOpenUser(report.reporterId)}
          className="font-bold text-totoro-blue hover:underline"
        >
          {report.reporterName}
        </button>{' '}
        denunciou{' '}
        <button
          type="button"
          onClick={() => onOpenUser(report.reportedUserId)}
          className="font-bold text-totoro-orange hover:underline"
        >
          {report.reportedName}
        </button>
      </p>
      <p className="mt-2 whitespace-pre-wrap rounded-lg bg-[var(--surface-raised)] p-3 text-sm text-foreground/75">
        {report.details || (
          <span className="italic text-foreground/45">Sem detalhes informados.</span>
        )}
      </p>

      {report.resolutionNote && (
        <p className="mt-2 text-xs text-foreground/60">
          <strong>Nota da moderação:</strong> {report.resolutionNote}
        </p>
      )}
      {report.reviewedAt && report.status !== 'open' && (
        <p className="mt-1 text-xs text-foreground/45">
          Resolvida {formatDateTime(report.reviewedAt)}
        </p>
      )}

      {showNote && (
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Nota interna (opcional): o que foi verificado ou decidido"
          maxLength={1000}
          className="mt-3 min-h-20 w-full rounded-lg bg-[var(--input-bg)] p-3 text-sm shadow-[inset_0_0_0_1px_var(--hairline)] outline-none focus:ring-4 focus:ring-totoro-blue/15"
        />
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {report.status === 'open' ? (
          <>
            <Button size="sm" variant="success" onClick={() => resolve('reviewed')} disabled={busy}>
              Marcar como revisada
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => resolve('dismissed')}
              disabled={busy}
            >
              Dispensar
            </Button>
            {!showNote && (
              <Button size="sm" variant="ghost" onClick={() => setShowNote(true)}>
                Adicionar nota
              </Button>
            )}
            {onDisable && (
              <Button size="sm" variant="ghost" onClick={onDisable} disabled={busy}>
                <ShieldBan className="h-4 w-4" />
                Desativar denunciado
              </Button>
            )}
          </>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => resolve('open')} disabled={busy}>
            Reabrir
          </Button>
        )}
      </div>
    </article>
  );
}

export function AdminReportsPanel({
  reports,
  busy,
  compact = false,
  onOpenUser,
  onSetStatus,
  onDisableUser
}: AdminReportsPanelProps) {
  const [filter, setFilter] = useState<Filter>('open');
  const [toDisable, setToDisable] = useState<AdminReportRow | null>(null);

  const counts = useMemo(
    () => ({
      open: reports.filter((report) => report.status === 'open').length,
      reviewed: reports.filter((report) => report.status === 'reviewed').length,
      dismissed: reports.filter((report) => report.status === 'dismissed').length,
      all: reports.length
    }),
    [reports]
  );

  const visible = (filter === 'all' ? reports : reports.filter((r) => r.status === filter)).slice(
    0,
    compact ? 3 : undefined
  );

  const filters: Array<[Filter, string]> = [
    ['open', 'Abertas'],
    ['reviewed', 'Revisadas'],
    ['dismissed', 'Dispensadas'],
    ['all', 'Todas']
  ];

  return (
    <div className="space-y-3">
      {!compact && (
        <div
          className="flex gap-1 overflow-x-auto rounded-lg bg-[var(--surface-muted)] p-1 no-scrollbar"
          role="tablist"
        >
          {filters.map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={filter === id}
              onClick={() => setFilter(id)}
              className={`flex shrink-0 grow items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-black uppercase tracking-wide transition ${
                filter === id
                  ? 'bg-totoro-blue text-white'
                  : 'text-foreground/60 hover:bg-[var(--surface-hover)]'
              }`}
            >
              {label}
              <span
                className={`rounded-full px-1.5 text-[10px] ${filter === id ? 'bg-white/25' : 'bg-foreground/10'}`}
              >
                {counts[id]}
              </span>
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyPanel
          icon={<Flag className="h-6 w-6 opacity-50" />}
          label={
            filter === 'open' ? 'Nenhuma denúncia aberta. Tudo em ordem!' : 'Nenhuma denúncia aqui.'
          }
        />
      ) : (
        visible.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            busy={busy === `report-${report.id}`}
            onOpenUser={onOpenUser}
            onSetStatus={onSetStatus}
            onDisable={onDisableUser ? () => setToDisable(report) : undefined}
          />
        ))
      )}

      <ConfirmDialog
        open={!!toDisable}
        title="Desativar conta denunciada"
        description={
          <>
            A conta de <strong>{toDisable?.reportedName}</strong> será desativada e todas as sessões
            encerradas. Você pode reativá-la depois na ficha do usuário.
          </>
        }
        confirmLabel="Desativar conta"
        busy={busy === 'disable'}
        onClose={() => setToDisable(null)}
        onConfirm={async () => {
          if (!toDisable || !onDisableUser) return;
          const ok = await onDisableUser(toDisable.reportedUserId);
          if (ok) setToDisable(null);
        }}
      />
    </div>
  );
}
