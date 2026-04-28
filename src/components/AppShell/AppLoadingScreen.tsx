'use client';
import { motion } from 'motion/react';
import { Leaf } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface AppLoadingScreenProps {
  isInitialized: boolean;
}

export function AppLoadingScreen({ isInitialized }: AppLoadingScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <main className="text-center">
        <motion.div
          className="mb-6 flex justify-center text-totoro-blue"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Leaf size={56} strokeWidth={1.8} />
        </motion.div>
        {isInitialized ? (
          <>
            <h2 className="text-3xl font-serif font-bold text-totoro-gray mb-3 pb-2 shadow-[inset_0_-2px_0_rgba(var(--primary-rgb),0.1)] inline-block">
              {t('app.loading.title')}
            </h2>
            <p className="text-totoro-blue/70 font-semibold uppercase tracking-[0.2em] text-[10px] font-sans">
              {t('app.loading.subtitle')}
            </p>
          </>
        ) : (
          <div className="h-20 opacity-0"></div>
        )}
      </main>
    </div>
  );
}
