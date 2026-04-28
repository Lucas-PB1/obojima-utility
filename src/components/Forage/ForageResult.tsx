'use client';
import React from 'react';
import { ForageAttempt } from '@/types/ingredients';
import { ContentCard } from '@/components/ui';
import { useForageResult } from '@/hooks/useForageResult';
import { Gift, Moon, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ForageResultProps {
  result: ForageAttempt | null;
}

import { useTranslation } from '@/hooks/useTranslation';

import { useEnglishIngredientNames } from '@/hooks/useEnglishIngredientNames';

export function ForageResult({ result }: ForageResultProps) {
  const { regionDisplayName, particles, showDoubleForage } = useForageResult(result);
  const { t } = useTranslation();
  const { getEnglishName } = useEnglishIngredientNames();

  if (!result) return null;

  const normalizeRarityKey = (r: string) => {
    const lower = r.toLowerCase();
    if (lower === 'unique' || lower === 'único' || lower === 'ú') return 'unico';
    if (lower === 'rara') return 'rare';
    return lower;
  };

  const rarityKey = normalizeRarityKey(result.rarity || 'common');
  const englishName = result.ingredient ? getEnglishName(result.ingredient.id, rarityKey) : '';

  return (
    <ContentCard className="!p-0 !border-transparent overflow-hidden shadow-[var(--shadow-raised)]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className={`relative min-h-[400px] flex flex-col justify-center transition-all duration-700 ${
          result.success
            ? 'bg-gradient-to-br from-[#10B981] via-[#3B82F6] to-[#F59E0B]'
            : 'bg-gradient-to-br from-[#4B5563] via-[#1F2937] to-[#111827]'
        }`}
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>

        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white blur-[1px]"
            style={particle.style}
            animate={{ y: [0, -18, 0], x: [0, 8, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        <div className="relative z-10 p-8 text-white">
          <div className="text-center mb-10">
            <motion.div
              className={`mb-4 flex justify-center ${
                result.success
                  ? 'drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]'
                  : 'grayscale opacity-50'
              }`}
              animate={{ scale: result.success ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 1.8, repeat: result.success ? Infinity : 0 }}
            >
              {result.success ? <Sparkles size={64} /> : <Moon size={64} />}
            </motion.div>
            <h3 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">
              {result.success ? t('forage.result.success.title') : t('forage.result.failure.title')}
            </h3>
            <p className="text-sm font-bold opacity-80 uppercase tracking-[0.3em]">
              {result.success ? t('forage.result.success.desc') : t('forage.result.failure.desc')}
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center justify-center gap-8 bg-black/20 backdrop-blur-md rounded-lg p-6 w-full max-w-sm shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_22px_44px_-28px_rgba(0,0,0,0.75)]">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">
                  {t('forage.result.roll')}
                </p>
                <p
                  className={`text-5xl font-black ${result.success ? 'text-white' : 'text-totoro-orange'}`}
                >
                  {result.roll}
                </p>
              </div>
              <div className="h-12 w-[1px] bg-white/10"></div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">
                  {t('forage.result.dc')}
                </p>
                <p className="text-5xl font-black text-white/40">{result.dc}</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] tracking-widest">
                DC {result.dcRange} • {t(`constants.rarity.${rarityKey}`)}
              </span>
              <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] tracking-widest">
                {t('forage.result.region', regionDisplayName)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {result.success && result.ingredient && (
        <div className="p-8 bg-background">
          <div className="text-center mb-6">
            <Gift className="mx-auto mb-2 h-8 w-8 text-totoro-orange" />
            <h4 className="font-black text-foreground text-xl uppercase tracking-tight">
              {t('forage.result.ingredient.title')}
            </h4>
            {showDoubleForage && (
              <div className="mt-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg px-4 py-3 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.16)]">
                <div className="text-purple-500 text-sm font-black flex items-center justify-center gap-2">
                  <span>✨</span>
                  {t('forage.result.double.title')}
                  <span>✨</span>
                </div>
                <p className="text-purple-500 text-[10px] font-bold mt-1 uppercase">
                  {t('forage.result.double.desc')}
                </p>
              </div>
            )}
          </div>

          <div className="bg-totoro-blue/5 rounded-lg p-6 mb-6 shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.12),var(--shadow-soft)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 text-4xl opacity-10 font-black italic">
              {t(`constants.rarity.${rarityKey}`)}
            </div>
            <h5 className="font-black text-foreground text-2xl mb-1 relative z-10">
              {result.ingredient.nome}
            </h5>
            {englishName && (
              <p className="text-sm text-foreground/50 italic mb-2 relative z-10 font-medium">
                {englishName}
              </p>
            )}
            <p className="text-foreground/60 leading-relaxed italic relative z-10 mt-2">
              &quot;{result.ingredient.descricao}&quot;
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-totoro-orange/10 rounded-lg p-4 text-center shadow-[inset_0_0_0_1px_rgba(var(--danger-rgb),0.16)]">
              <div className="text-totoro-orange text-[10px] font-black uppercase mb-1 tracking-widest">
                {t('forage.result.stats.combat')}
              </div>
              <div className="text-totoro-orange font-black text-2xl">
                {result.ingredient.combat}
              </div>
            </div>
            <div className="bg-totoro-blue/10 rounded-lg p-4 text-center shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.16)]">
              <div className="text-totoro-blue text-[10px] font-black uppercase mb-1 tracking-widest">
                {t('forage.result.stats.utility')}
              </div>
              <div className="text-totoro-blue font-black text-2xl">
                {result.ingredient.utility}
              </div>
            </div>
            <div className="bg-totoro-yellow/10 rounded-lg p-4 text-center shadow-[inset_0_0_0_1px_rgba(var(--whimsy-rgb),0.16)]">
              <div className="text-totoro-yellow text-[10px] font-black uppercase mb-1 tracking-widest">
                {t('forage.result.stats.whimsy')}
              </div>
              <div className="text-totoro-yellow font-black text-2xl">
                {result.ingredient.whimsy}
              </div>
            </div>
          </div>
        </div>
      )}
    </ContentCard>
  );
}
