'use client';
import React, { useState } from 'react';
import { Flag, MessageCircle, Gift, ShieldBan, UserMinus } from 'lucide-react';
import { Friend, ReportReason } from '@/types/social';
import { Button, UserAvatar } from '@/components/ui';
import { TradeModal } from '@/components/Social';
import { useTranslation } from '@/hooks/useTranslation';
import { socialService } from '@/services/socialService';

interface FriendListProps {
  friends: Friend[];
  onChat: (friend: Friend) => void;
}

export function FriendList({ friends, onChat }: FriendListProps) {
  const { t } = useTranslation();
  const [tradeFriend, setTradeFriend] = useState<Friend | null>(null);
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);
  const [friendToBlock, setFriendToBlock] = useState<Friend | null>(null);
  const [friendToReport, setFriendToReport] = useState<Friend | null>(null);
  const [reportReason, setReportReason] = useState<ReportReason>('other');
  const [reportDetails, setReportDetails] = useState('');
  const [removing, setRemoving] = useState(false);

  const handleRemoveFriend = async () => {
    if (!friendToRemove) return;
    setRemoving(true);
    try {
      await socialService.removeFriend(friendToRemove.userId);
    } catch (error) {
      console.error('Error removing friend:', error);
    } finally {
      setRemoving(false);
      setFriendToRemove(null);
    }
  };

  const handleBlockFriend = async () => {
    if (!friendToBlock) return;
    setRemoving(true);
    try {
      await socialService.blockUser(friendToBlock.userId);
    } finally {
      setRemoving(false);
      setFriendToBlock(null);
    }
  };

  const handleReportFriend = async () => {
    if (!friendToReport) return;
    setRemoving(true);
    try {
      await socialService.reportUser(friendToReport.userId, reportReason, reportDetails);
      setFriendToReport(null);
      setReportReason('other');
      setReportDetails('');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {friends.length === 0 && (
        <div className="col-span-full text-center py-10">
          <div className="text-4xl mb-4">🍃</div>
          <p className="text-totoro-gray/60">{t('social.friends.empty')}</p>
        </div>
      )}

      {friends.map((friend) => (
        <div
          key={friend.userId}
          className="glass-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <UserAvatar
              src={friend.photoURL}
              name={friend.displayName}
              className="w-12 h-12 bg-gradient-to-br from-totoro-blue/20 to-totoro-green/20 shadow-inner"
              fallbackClassName="text-xl"
            />
            <div>
              <h3 className="font-bold text-totoro-gray">{friend.displayName}</h3>
              <p className="text-xs text-totoro-blue/60 flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${friend.status === 'online' ? 'bg-green-400' : 'bg-gray-400'}`}
                ></span>
                {t(`social.friends.status.${friend.status}`)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onChat(friend)}
              title={t('social.chat.open')}
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setTradeFriend(friend)}>
              <Gift className="w-4 h-4 mr-2" />
              {t('social.trade.button')}
            </Button>
            <Button
              size="sm"
              variant="danger"
              className="px-2"
              onClick={() => setFriendToRemove(friend)}
              title={t('social.friends.remove')}
            >
              <UserMinus className="w-5 h-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="px-2"
              onClick={() => setFriendToBlock(friend)}
              title={t('social.friends.block')}
            >
              <ShieldBan className="w-5 h-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="px-2"
              onClick={() => setFriendToReport(friend)}
              title={t('social.friends.report')}
            >
              <Flag className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ))}

      {tradeFriend && <TradeModal friend={tradeFriend} onClose={() => setTradeFriend(null)} />}

      {friendToRemove && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-sm w-full space-y-4">
            <h3 className="text-xl font-bold text-totoro-gray">
              {t('social.friends.removeTitle')}
            </h3>
            <p className="text-totoro-gray/80">
              {t('social.friends.removeConfirm').replace('{name}', friendToRemove.displayName)}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setFriendToRemove(null)}>
                {t('common.cancel')}
              </Button>
              <Button variant="danger" onClick={handleRemoveFriend} disabled={removing}>
                {removing ? '...' : t('common.confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {friendToBlock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-sm w-full space-y-4">
            <h3 className="text-xl font-bold text-totoro-gray">{t('social.friends.blockTitle')}</h3>
            <p className="text-totoro-gray/80">
              {t('social.friends.blockConfirm').replace('{name}', friendToBlock.displayName)}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setFriendToBlock(null)}>
                {t('common.cancel')}
              </Button>
              <Button variant="danger" onClick={handleBlockFriend} disabled={removing}>
                {removing ? '...' : t('common.confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {friendToReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold text-totoro-gray">
              {t('social.friends.reportTitle')}
            </h3>
            <p className="text-sm text-totoro-gray/70">
              {t('social.friends.reportDescription').replace('{name}', friendToReport.displayName)}
            </p>
            <select
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value as ReportReason)}
              className="w-full rounded-lg bg-[--input-bg] p-3 text-sm shadow-[inset_0_0_0_1px_var(--hairline)]"
            >
              {(['spam', 'abuse', 'harassment', 'trade', 'other'] as ReportReason[]).map(
                (reason) => (
                  <option key={reason} value={reason}>
                    {t(`social.report.reason.${reason}`)}
                  </option>
                )
              )}
            </select>
            <textarea
              value={reportDetails}
              onChange={(event) => setReportDetails(event.target.value)}
              className="min-h-24 w-full rounded-lg bg-[--input-bg] p-3 text-sm shadow-[inset_0_0_0_1px_var(--hairline)]"
              placeholder={t('social.friends.reportDetails')}
              maxLength={1000}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setFriendToReport(null)}>
                {t('common.cancel')}
              </Button>
              <Button variant="danger" onClick={handleReportFriend} disabled={removing}>
                {removing ? '...' : t('social.friends.report')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
