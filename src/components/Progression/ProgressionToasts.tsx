'use client';
import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PartyPopper, Trophy, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { ProgressionEvent } from '@/hooks/useProgression';
import { ACHIEVEMENT_ICONS } from './achievementIcons';

interface ProgressionToastsProps {
  events: ProgressionEvent[];
  onDismiss: (id: string) => void;
  onOpen: () => void;
}

const AUTO_DISMISS_MS = 5000;

function Toast({
  event,
  onDismiss,
  onOpen
}: {
  event: ProgressionEvent;
  onDismiss: (id: string) => void;
  onOpen: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(event.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [event.id, onDismiss]);

  const isLevel = event.kind === 'level';
  const Icon = isLevel ? PartyPopper : ACHIEVEMENT_ICONS[event.achievementId] || Trophy;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="pointer-events-auto flex w-full items-center gap-3 rounded-lg bg-modal-bg p-3 shadow-[var(--shadow-raised)] ring-1 ring-inset ring-[color:var(--hairline-strong)]"
      role="status"
    >
      <button
        type="button"
        onClick={() => {
          onOpen();
          onDismiss(event.id);
        }}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white shadow-[var(--shadow-soft)] ${
            isLevel
              ? 'bg-gradient-to-br from-totoro-green to-totoro-blue'
              : 'bg-gradient-to-br from-totoro-yellow to-totoro-orange'
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] font-black uppercase tracking-[0.14em] text-totoro-blue">
            {isLevel ? t('progression.toast.levelUp') : t('progression.toast.achievement')}
          </span>
          <span className="block truncate font-bold text-totoro-gray">
            {isLevel
              ? `${t('progression.level')} ${event.level} · ${t(event.titleKey)}`
              : t(`progression.achievement.${event.achievementId}.name`)}
          </span>
          {!isLevel && (
            <span className="block text-xs font-bold text-totoro-orange">+{event.xpReward} XP</span>
          )}
        </span>
      </button>
      <button
        type="button"
        onClick={() => onDismiss(event.id)}
        aria-label={t('common.close')}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-totoro-gray/50 hover:bg-totoro-blue/10"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ProgressionToasts({ events, onDismiss, onOpen }: ProgressionToastsProps) {
  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-24 z-[60] mx-auto flex max-w-sm flex-col gap-2 md:bottom-6 md:left-auto md:right-6 md:mx-0">
      <AnimatePresence initial={false}>
        {events.slice(0, 2).map((event) => (
          <Toast key={event.id} event={event} onDismiss={onDismiss} onOpen={onOpen} />
        ))}
      </AnimatePresence>
    </div>
  );
}
