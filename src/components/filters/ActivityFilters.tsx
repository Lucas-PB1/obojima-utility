import React from 'react';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ForageAttempt } from '@/types/ingredients';
import FilterSection from '@/components/ui/FilterSection';
import { RESULT_OPTIONS, DATE_OPTIONS } from '@/constants/filters/activity';
import { useActivityFilters, ResultFilterType, DateFilterType } from '@/hooks/useFilters';
import { useTranslation } from '@/hooks/useTranslation';

interface ActivityFiltersProps {
  attempts: ForageAttempt[];
  onFilteredAttempts: (attempts: ForageAttempt[]) => void;
}

export default function ActivityFilters({ attempts, onFilteredAttempts }: ActivityFiltersProps) {
  const { t } = useTranslation();
  const {
    filter,
    setFilter,
    regionFilter,
    setRegionFilter,
    dateFilter,
    setDateFilter,
    filteredAttempts,
    getRegionOptions,
    clearFilters
  } = useActivityFilters(attempts);

  React.useEffect(() => {
    onFilteredAttempts(filteredAttempts);
  }, [filteredAttempts, onFilteredAttempts]);

  const translatedResultOptions = RESULT_OPTIONS.map((opt) => ({
    ...opt,
    label: t(opt.label)
  }));

  const translatedDateOptions = DATE_OPTIONS.map((opt) => ({
    ...opt,
    label: t(opt.label)
  }));

  return (
    <FilterSection className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          value={filter}
          onChange={(value) => setFilter(value as ResultFilterType)}
          options={translatedResultOptions}
          label={t('activity.filters.result.label')}
        />

        <Select
          value={regionFilter}
          onChange={setRegionFilter}
          options={getRegionOptions()}
          label={t('activity.filters.region.label')}
        />

        <Select
          value={dateFilter}
          onChange={(value) => setDateFilter(value as DateFilterType)}
          options={translatedDateOptions}
          label={t('activity.filters.date.label')}
        />

        <div className="flex items-end">
          <Button onClick={clearFilters} variant="secondary" fullWidth>
            {t('activity.filters.clear')}
          </Button>
        </div>
      </div>
    </FilterSection>
  );
}
