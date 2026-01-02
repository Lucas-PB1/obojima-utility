import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Friend } from '@/types/social';
import Button from '@/components/ui/Button';
import TradeModal from '@/components/Social/TradeModal';
import Image from 'next/image';

interface FriendListProps {
  friends: Friend[];
  onChat: (friend: Friend) => void;
}

export default function FriendList({ friends, onChat }: FriendListProps) {
  const { t } = useTranslation();
  const [tradeFriend, setTradeFriend] = useState<Friend | null>(null);

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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-totoro-blue/20 to-totoro-green/20 flex items-center justify-center text-xl shadow-inner">
              {friend.photoURL ? (
                <Image
                  src={friend.photoURL}
                  alt={friend.displayName}
                  width={48}
                  height={48}
                  className="rounded-full w-full h-full object-cover"
                />
              ) : (
                '👤'
              )}
            </div>
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
            <Button size="sm" variant="outline" onClick={() => onChat(friend)}>
              💬 Chat
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setTradeFriend(friend)}>
              🎁 {t('social.trade.button')}
            </Button>
          </div>
        </div>
      ))}

      {tradeFriend && <TradeModal friend={tradeFriend} onClose={() => setTradeFriend(null)} />}
    </div>
  );
}
