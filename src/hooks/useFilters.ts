import { useState, useMemo } from 'react';
import { CollectedIngredient, ForageAttempt } from '@/types/ingredients';
import { ingredientsService } from '@/services/ingredientsService';

export type FilterType = 'all' | 'available' | 'used';
export type SortType = 'date' | 'name' | 'rarity';
export type ResultFilterType = 'all' | 'success' | 'failure';
export type DateFilterType = 'all' | 'today' | 'week' | 'month';

export function useIngredientFilters(ingredients: CollectedIngredient[]) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIngredients = useMemo(() => {
    return ingredients
      .filter(ingredient => {
        if (filter === 'available') return !ingredient.used;
        if (filter === 'used') return ingredient.used;
        return true;
      })
      .filter(ingredient => 
        ingredient.ingredient.nome_portugues.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingredient.ingredient.nome_ingles.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.ingredient.nome_portugues.localeCompare(b.ingredient.nome_portugues);
          case 'rarity':
            return b.ingredient.id - a.ingredient.id;
          case 'date':
          default:
            return b.collectedAt.getTime() - a.collectedAt.getTime();
        }
      });
  }, [ingredients, filter, sortBy, searchTerm]);

  const clearFilters = () => {
    setFilter('all');
    setSortBy('date');
    setSearchTerm('');
  };

  return {
    filter,
    setFilter,
    sortBy,
    setSortBy,
    searchTerm,
    setSearchTerm,
    filteredIngredients,
    clearFilters
  };
}

export function useActivityFilters(attempts: ForageAttempt[]) {
  const [filter, setFilter] = useState<ResultFilterType>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');

  const filteredAttempts = useMemo(() => {
    return attempts
      .filter(attempt => {
        if (filter === 'success') return attempt.success;
        if (filter === 'failure') return !attempt.success;
        return true;
      })
      .filter(attempt => {
        if (regionFilter === 'all') return true;
        return attempt.region === regionFilter;
      })
      .filter(attempt => {
        const now = new Date();
        const attemptDate = attempt.timestamp;
        
        switch (dateFilter) {
          case 'today':
            return attemptDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return attemptDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return attemptDate >= monthAgo;
          default:
            return true;
        }
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [attempts, filter, regionFilter, dateFilter]);

  const getRegionOptions = () => {
    const regions = [...new Set(attempts.map(a => a.region))];
    return regions.map(region => ({
      value: region,
      label: ingredientsService.getRegionDisplayName(region)
    }));
  };

  const clearFilters = () => {
    setFilter('all');
    setRegionFilter('all');
    setDateFilter('all');
  };

  return {
    filter,
    setFilter,
    regionFilter,
    setRegionFilter,
    dateFilter,
    setDateFilter,
    filteredAttempts,
    getRegionOptions,
    clearFilters
  };
}
