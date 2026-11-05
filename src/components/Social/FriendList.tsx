'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Flag,
  Gift,
  MessageCircle,
  MoreVertical,
  Search,
  ShieldBan,
  UserMinus
} from 'lucide-react';
import { Friend, ReportReason } from '@/types/social';
import { Button, Modal, UserAvatar } from '@/components/ui';
import { TradeModal } from '@/components/Social';
import { useTranslation } from '@/hooks/useTranslation';
import { socialService } from '@/services/socialService';

interface FriendListProps {
  friends: Friend[];
  onChat: (friend: Friend) => void;
  onFindFriends: () => void;
}

type PendingAction = { type: 'remove' | 'block' | 'report'; friend: Friend } | null;

const REPORT_REASONS: ReportReason[] = ['spam', 'abuse', 'harassment', 'trade', 'other'];

function FriendMenu({
  onRemove,
  onBlock,
  onReport
}: {
  onRemove: () => void;
  onBlock: () => void;
  onReport: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === 'Escape') setOpen(false);
        return;
      }
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const item = (label: string, Icon: typeof Flag, action: () => void, danger = false) => (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        setOpen(false);
        action();
      }}
      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold transition hover:bg-totoro-blue/10 ${
        danger ? 'text-totoro-orange' : 'text-totoro-gray'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('social.friends.more')}
        title={t('social.friends.more')}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-totoro-gray/60 transition hover:bg-totoro-blue/10 hover:text-totoro-blue"
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-30 w-52 rounded-lg bg-modal-bg p-1 shadow-[var(--shadow-raised)] ring-1 ring-inset ring-[color:var(--hairline-strong)]"
        >
          {item(t('social.friends.remove'), UserMinus, onRemove, true)}
          {item(t('social.friends.block'), ShieldBan, onBlock, true)}
          {item(t('social.friends.report'), Flag, onReport)}
        </div>
      )}
    </div>
  );
}

export function FriendList({ friends, onChat, onFindFriends }: FriendListProps) {
  const { t } = useTranslation();
  const [tradeFriend, setTradeFriend] = useState<Friend | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [reportReason, setReportReason] = useState<ReportReason>('other');
  const [reportDetails, setReportDetails] = useState('');
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const sortedFriends = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return [...friends]
      .filter((friend) => !term || friend.displayName.toLowerCase().includes(term))
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'online' ? -1 : 1;
        return a.displayName.localeCompare(b.displayName);
      });
  }, [friends, filter]);

  const onlineCount = friends.filter((friend) => friend.status === 'online').length;

  const closeDialog = () => {
    if (working) return;
    setPending(null);
    setActionError(null);
    setReportReason('other');
    setReportDetails('');
  };

  const confirmAction = async () => {
    if (!pending) return;
    setWorking(true);
    setActionError(null);
    try {
      if (pending.type === 'remove') await socialService.removeFriend(pending.friend.userId);
      if (pending.type === 'block') await socialService.blockUser(pending.friend.userId);
      if (pending.type === 'report') {
        await socialService.reportUser(pending.friend.userId, reportReason, reportDetails);
        setFeedback(t('social.friends.reportSent'));
        setTimeout(() => setFeedback(null), 4000);
      }
      setPending(null);
      setReportReason('other');
      setReportDetails('');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('social.error.generic'));
    } finally {
      setWorking(false);
    }
  };

  if (friends.length === 0) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <div className="mb-4 text-4xl">🍃</div>
        <p className="mb-5 text-totoro-gray/60">{t('social.friends.empty')}</p>
        <Button onClick={onFindFriends}>
          <Search className="h-4 w-4" />
          {t('social.friends.findFriends')}
        </Button>
      </div>
    );
  }

  const dialogTitle =
    pending?.type === 'remove'
      ? t('social.friends.removeTitle')
      : pending?.type === 'block'
        ? t('social.friends.blockTitle')
        : t('social.friends.reportTitle');

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-totoro-gray/70">
          <span className="font-bold text-totoro-gray">{friends.length}</span>{' '}
          {t('social.friends.count')} ·{' '}
          <span className="font-bold text-green-600">{onlineCount}</span>{' '}
          {t('social.friends.onlineNow')}
        </p>
        {friends.length > 5 && (
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder={t('social.friends.filter')}
            aria-label={t('social.friends.filter')}
            className="h-10 w-full rounded-lg bg-[var(--input-bg)] px-3 text-sm shadow-[inset_0_0_0_1px_var(--hairline)] focus:outline-none focus:ring-2 focus:ring-totoro-blue/30 sm:w-64"
          />
        )}
      </div>

      {feedback && (
        <div className="rounded-lg bg-green-100/80 px-4 py-3 text-sm font-bold text-green-700">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {sortedFriends.map((friend) => (
          <div key={friend.userId} className="glass-panel flex items-center gap-3 p-3 sm:p-4">
            <div className="relative shrink-0">
              <UserAvatar
                src={friend.photoURL}
                name={friend.displayName}
                className="h-12 w-12 bg-gradient-to-br from-totoro-blue/20 to-totoro-green/20"
                fallbackClassName="text-xl"
              />
              <span
                className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-2 ring-[color:var(--surface-raised)] ${
                  friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-bold text-totoro-gray">{friend.displayName}</h3>
              <p className="text-xs text-totoro-gray/60">
                {t(`social.friends.status.${friend.status}`)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0!"
                onClick={() => onChat(friend)}
                title={t('social.chat.open')}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-9 px-2.5 sm:px-3"
                onClick={() => setTradeFriend(friend)}
                title={t('social.trade.button')}
              >
                <Gift className="h-4 w-4" />
                <span className="hidden sm:inline">{t('social.trade.button')}</span>
              </Button>
              <FriendMenu
                onRemove={() => setPending({ type: 'remove', friend })}
                onBlock={() => setPending({ type: 'block', friend })}
                onReport={() => setPending({ type: 'report', friend })}
              />
            </div>
          </div>
        ))}
        {sortedFriends.length === 0 && (
          <p className="col-span-full py-6 text-center text-sm text-totoro-gray/50">
            {t('social.search.noResults')}
          </p>
        )}
      </div>

      {tradeFriend && <TradeModal friend={tradeFriend} onClose={() => setTradeFriend(null)} />}

      <Modal isOpen={!!pending} onClose={closeDialog} title={dialogTitle} size="sm">
        {pending && (
          <div className="space-y-4">
            {pending.type === 'report' ? (
              <>
                <p className="text-sm text-totoro-gray/70">
                  {t('social.friends.reportDescription').replace(
                    '{name}',
                    pending.friend.displayName
                  )}
                </p>
                <select
                  value={reportReason}
                  onChange={(event) => setReportReason(event.target.value as ReportReason)}
                  aria-label={t('social.friends.reportReason')}
                  className="w-full rounded-lg bg-[var(--input-bg)] p-3 text-sm shadow-[inset_0_0_0_1px_var(--hairline)]"
                >
                  {REPORT_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {t(`social.report.reason.${reason}`)}
                    </option>
                  ))}
                </select>
                <textarea
                  value={reportDetails}
                  onChange={(event) => setReportDetails(event.target.value)}
                  className="min-h-24 w-full rounded-lg bg-[var(--input-bg)] p-3 text-sm shadow-[inset_0_0_0_1px_var(--hairline)]"
                  placeholder={t('social.friends.reportDetails')}
                  maxLength={1000}
                />
              </>
            ) : (
              <p className="text-totoro-gray/80">
                {t(
                  pending.type === 'remove'
                    ? 'social.friends.removeConfirm'
                    : 'social.friends.blockConfirm'
                ).replace('{name}', pending.friend.displayName)}
              </p>
            )}
            {actionError && <p className="text-sm font-bold text-red-600">{actionError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={closeDialog} disabled={working}>
                {t('common.cancel')}
              </Button>
              <Button variant="danger" onClick={confirmAction} disabled={working}>
                {working
                  ? '...'
                  : pending.type === 'report'
                    ? t('social.friends.report')
                    : t('common.confirm')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
