'use client';
import React from 'react';
import StatsGrid from '@/components/ui/StatsGrid';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import ContentCard from '@/components/ui/ContentCard';
import { useActivityLog } from '@/hooks/useActivityLog';
import ActivityFilters from '@/components/filters/ActivityFilters';
import { ingredientsService } from '@/services/ingredientsService';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettings } from '@/hooks/useSettings';

export default function ActivityLog() {
  const { t } = useTranslation();
  const { attempts, filteredAttempts, setFilteredAttempts, statsData } = useActivityLog();
  const { settings } = useSettings();

  return (
    <div className="space-y-6">
      <PageHeader title={t('activity.title')} subtitle={t('activity.subtitle')} icon="📋" />

      <StatsGrid title={t('activity.stats.title')} stats={statsData} className="mb-8" />

      <ActivityFilters attempts={attempts} onFilteredAttempts={setFilteredAttempts} />

      <ContentCard title={t('activity.list.title', filteredAttempts.length)}>
        {filteredAttempts.length === 0 ? (
          <EmptyState
            icon="📋"
            title={t('activity.empty.title')}
            description={t('activity.empty.desc')}
          />
        ) : (
          <div className="space-y-4">
            {filteredAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  attempt.success
                    ? 'bg-totoro-green/10 border-totoro-green/20 hover:border-totoro-green/30'
                    : 'bg-totoro-orange/10 border-totoro-orange/20 hover:border-totoro-orange/30'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`text-2xl ${
                          attempt.success ? 'text-totoro-green' : 'text-totoro-orange'
                        }`}
                      >
                        {attempt.success ? '🎉' : '😞'}
                      </span>
                      <h3
                        className={`text-lg font-bold ${
                          attempt.success ? 'text-totoro-green' : 'text-totoro-orange'
                        }`}
                      >
                        {attempt.success
                          ? t('activity.card.success.title')
                          : t('activity.card.failure.title')}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          attempt.rarity === 'comum'
                            ? 'bg-totoro-green/20 text-totoro-green'
                            : 'bg-totoro-blue/20 text-totoro-blue'
                        }`}
                      >
                        {attempt.rarity}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-foreground/70">
                          {t('activity.card.region')}
                        </span>
                        <p className="text-foreground/60">
                          {ingredientsService.getRegionDisplayName(
                            attempt.region,
                            settings.language
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-foreground/70">
                          {t('activity.card.test')}
                        </span>
                        <p className="text-foreground/60 capitalize">
                          {attempt.testType === 'natureza'
                            ? `🌱 ${t('constants.forage.testType.nature')}`
                            : `🏕️ ${t('constants.forage.testType.survival')}`}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-foreground/70">
                          {t('activity.card.roll')}
                        </span>
                        <p className="text-foreground/60">
                          {attempt.roll} (DC {attempt.dcRange})
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-foreground/70">
                          {t('activity.card.date')}
                        </span>
                        <p className="text-foreground/60">
                          {attempt.timestamp.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="bg-totoro-blue/20 text-totoro-blue px-2 py-1 rounded text-xs">
                        {t(
                          'activity.card.bonus',
                          attempt.modifier > 0 ? '+' : '',
                          attempt.modifier
                        )}
                      </span>
                      {attempt.bonusDice && (
                        <span className="bg-totoro-yellow/20 text-totoro-yellow px-2 py-1 rounded text-xs">
                          {attempt.bonusDice.value}d{attempt.bonusDice.type.substring(1)}
                        </span>
                      )}
                      {attempt.advantage !== 'normal' && (
                        <span className="bg-totoro-gray/20 text-totoro-gray px-2 py-1 rounded text-xs">
                          {attempt.advantage === 'vantagem'
                            ? t('activity.card.advantage')
                            : t('activity.card.disadvantage')}
                        </span>
                      )}
                    </div>
                  </div>

                  {attempt.success && attempt.ingredient && (
                    <div className="md:w-80">
                      <div className="bg-muted/50 p-4 rounded-lg border border-totoro-green/20">
                        <h4 className="font-bold text-totoro-green mb-2">
                          {t('activity.card.ingredient.title')}
                        </h4>
                        <p className="text-totoro-green font-medium mb-2">
                          {attempt.ingredient.nome}
                        </p>
                        <p className="text-sm text-foreground/60 mb-3">
                          {attempt.ingredient.descricao.substring(0, 120)}...
                        </p>
                        <div className="flex justify-center space-x-2">
                          <span className="bg-totoro-orange/20 text-totoro-orange px-2 py-1 rounded text-xs">
                            ⚔️ {attempt.ingredient.combat}
                          </span>
                          <span className="bg-totoro-blue/20 text-totoro-blue px-2 py-1 rounded text-xs">
                            🛠️ {attempt.ingredient.utility}
                          </span>
                          <span className="bg-totoro-yellow/20 text-totoro-yellow px-2 py-1 rounded text-xs">
                            ✨ {attempt.ingredient.whimsy}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ContentCard>
    </div>
  );
}
