'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ForageAttempt, PotionRecipe } from '@/types/ingredients';
import { useAuth } from '@/hooks/useAuth';
import { useCreatedPotionsData } from '@/hooks/useCreatedPotionsData';
import { useSocialData } from '@/contexts/SocialContext';
import { firebaseRecipeService } from '@/services/firebaseRecipeService';
import { authService } from '@/services/authService';
import { buildProgression, ProgressionSnapshot } from '@/features/progression/domain/progression';
import { isSameCalendarDay } from '@/lib/formatDate';

export type ProgressionEvent =
  | { id: string; kind: 'level'; level: number; titleKey: string }
  | { id: string; kind: 'achievement'; achievementId: string; xpReward: number };

interface StoredProgress {
  level: number;
  achievements: string[];
}

/** Data arrives from several realtime listeners; wait for it before celebrating. */
const SETTLE_DELAY_MS = 3500;

function storageKey(uid: string) {
  return `obojima:progression:${uid}`;
}

function readStored(uid: string): StoredProgress | null {
  try {
    const raw = window.localStorage.getItem(storageKey(uid));
    return raw ? (JSON.parse(raw) as StoredProgress) : null;
  } catch {
    return null;
  }
}

function writeStored(uid: string, value: StoredProgress) {
  try {
    window.localStorage.setItem(storageKey(uid), JSON.stringify(value));
  } catch {
    // Without storage the player just doesn't get celebration toasts.
  }
}

export function useProgression(attempts: ForageAttempt[]) {
  const { user } = useAuth();
  const { potions } = useCreatedPotionsData();
  const { friends, conversations } = useSocialData();
  const [recipes, setRecipes] = useState<PotionRecipe[]>([]);
  const [events, setEvents] = useState<ProgressionEvent[]>([]);
  const settledRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    return firebaseRecipeService.subscribeToRecipes(setRecipes);
  }, [user]);

  const snapshot: ProgressionSnapshot = useMemo(() => {
    const myId = authService.getUserId();
    const now = new Date();
    const messagesSentToday = conversations.filter(
      (conversation) =>
        conversation.lastMessage?.senderId === myId &&
        isSameCalendarDay(conversation.lastMessage.timestamp, now)
    ).length;

    return buildProgression({
      now,
      attempts: attempts.map((attempt) => ({
        timestamp: attempt.timestamp,
        success: attempt.success,
        found: Boolean(attempt.ingredient),
        rarity: attempt.ingredient?.raridade || attempt.rarity
      })),
      potions: potions.map((potion) => ({
        quantity: potion.quantity,
        createdAt: potion.createdAt
      })),
      recipes: recipes.map((recipe) => ({ id: recipe.id, createdAt: recipe.createdAt })),
      friendsCount: friends.length,
      messagesSentToday
    });
  }, [attempts, potions, recipes, friends.length, conversations]);

  useEffect(() => {
    settledRef.current = false;
    const timer = setTimeout(() => {
      settledRef.current = true;
    }, SETTLE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [user?.uid]);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) return;

    const unlocked = snapshot.achievements.filter((a) => a.unlocked).map((a) => a.id);
    const stored = readStored(uid);

    if (!stored || !settledRef.current) {
      // Baseline: never celebrate progress that already existed before this session.
      writeStored(uid, {
        level: Math.max(stored?.level || 0, snapshot.level.level),
        achievements: Array.from(new Set([...(stored?.achievements || []), ...unlocked]))
      });
      return;
    }

    const newEvents: ProgressionEvent[] = [];
    if (snapshot.level.level > stored.level) {
      newEvents.push({
        id: `level-${snapshot.level.level}`,
        kind: 'level',
        level: snapshot.level.level,
        titleKey: snapshot.level.titleKey
      });
    }
    snapshot.achievements
      .filter((a) => a.unlocked && !stored.achievements.includes(a.id))
      .forEach((a) =>
        newEvents.push({
          id: `achievement-${a.id}`,
          kind: 'achievement',
          achievementId: a.id,
          xpReward: a.xpReward
        })
      );

    if (newEvents.length === 0) return;

    writeStored(uid, {
      level: Math.max(stored.level, snapshot.level.level),
      achievements: Array.from(new Set([...stored.achievements, ...unlocked]))
    });
    setEvents((current) => [...current, ...newEvents]);
  }, [snapshot, user?.uid]);

  const dismissEvent = useCallback((id: string) => {
    setEvents((current) => current.filter((event) => event.id !== id));
  }, []);

  return { snapshot, events, dismissEvent };
}
