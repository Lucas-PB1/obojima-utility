'use client';
import React, { useMemo, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { AdminAuditEntry } from '../types';
import { AUDIT_ACTION_LABELS, auditTone, EmptyPanel, formatDateTime } from './adminUi';

interface AdminAuditListProps {
  entries: AdminAuditEntry[];
  onOpenUser?: (uid: string) => void;
  showTarget?: boolean;
  searchable?: boolean;
}

export function AdminAuditList({
  entries,
  onOpenUser,
  showTarget = true,
  searchable = false
}: AdminAuditListProps) {
  const [term, setTerm] = useState('');
  const filtered = useMemo(() => {
    const value = term.trim().toLowerCase();
    if (!value) return entries;
    return entries.filter((entry) =>
      [entry.summary, entry.actorName, entry.targetName, AUDIT_ACTION_LABELS[entry.action]]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value))
    );
  }, [entries, term]);

  return (
    <div className="space-y-3">
      {searchable && (
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Filtrar por ação, admin ou usuário"
          aria-label="Filtrar registro"
          className="w-full rounded-lg bg-[var(--input-bg)] px-3 py-2.5 text-sm shadow-[inset_0_0_0_1px_var(--hairline)] outline-none focus:ring-4 focus:ring-totoro-blue/15"
        />
      )}
      {filtered.length === 0 ? (
        <EmptyPanel
          icon={<ScrollText className="h-6 w-6 opacity-50" />}
          label={
            entries.length === 0
              ? 'Nenhuma ação de admin registrada ainda.'
              : 'Nada corresponde ao filtro.'
          }
        />
      ) : (
        <ol className="divide-y divide-[var(--hairline)]">
          {filtered.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-col gap-1.5 py-3 sm:flex-row sm:items-start sm:gap-3"
            >
              <span
                className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${auditTone(entry.action)}`}
              >
                {AUDIT_ACTION_LABELS[entry.action] || entry.action}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{entry.summary}</p>
                <p className="mt-0.5 text-xs text-foreground/55">
                  por <strong>{entry.actorName}</strong>
                  {showTarget && entry.targetUid && (
                    <>
                      {' '}
                      em{' '}
                      {onOpenUser ? (
                        <button
                          type="button"
                          onClick={() => onOpenUser(entry.targetUid as string)}
                          className="font-bold text-totoro-blue hover:underline"
                        >
                          {entry.targetName || entry.targetUid}
                        </button>
                      ) : (
                        <strong>{entry.targetName || entry.targetUid}</strong>
                      )}
                    </>
                  )}
                </p>
              </div>
              <time className="shrink-0 text-xs text-foreground/50" dateTime={entry.createdAt}>
                {formatDateTime(entry.createdAt)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
