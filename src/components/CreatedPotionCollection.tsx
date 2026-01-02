'use client';
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import StatsGrid from '@/components/ui/StatsGrid';
import ContentCard from '@/components/ui/ContentCard';
import { useCreatedPotionCollection } from '@/hooks/useCreatedPotionCollection';
import { useTranslation } from '@/hooks/useTranslation';
import { PotionFilter } from './Potions/Collection/PotionFilter';
import { PotionList } from './Potions/Collection/PotionList';
import { PotionDetailsModal } from './Potions/Collection/PotionDetailsModal';

export const CreatedPotionCollection: React.FC = () => {
  const { t } = useTranslation();
  const {
    filteredPotions,
    selectedPotion,
    showModal,
    closeModal,
    filter,
    setFilter,
    statsData,
    handlePotionClick,
    handleUsePotion,
    handleDeletePotion
  } = useCreatedPotionCollection();

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('potions.collection.title')}
        subtitle={t('potions.collection.subtitle')}
        icon="🧪"
      />

      <StatsGrid title={`📊 ${t('ui.labels.total')}`} stats={statsData} />

      <ContentCard>
        <PotionFilter
          filter={filter}
          setFilter={setFilter}
          filteredCount={filteredPotions.length}
        />
        
        <PotionList
          potions={filteredPotions}
          filter={filter}
          onPotionClick={handlePotionClick}
          onUsePotion={handleUsePotion}
        />
      </ContentCard>

      <PotionDetailsModal
        isOpen={showModal}
        onClose={closeModal}
        potion={selectedPotion}
        onUse={handleUsePotion}
        onDelete={handleDeletePotion}
      />
    </div>
  );
};
