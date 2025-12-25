import { useState, useMemo, useCallback } from 'react';
import { CollectedIngredient, ForageAttempt } from '@/types/ingredients';
import { ingredientsService } from '@/services/ingredientsService';

export type FilterType = 'all' | 'available' | 'used';
export type RarityFilterType = 'all' | 'comum' | 'incomum' | 'raro' | 'unico';
export type SortType = 'date' | 'name' | 'rarity';
export type ResultFilterType = 'all' | 'success' | 'failure';
export type DateFilterType = 'all' | 'today' | 'week' | 'month';

const filterIngredients = (ingredients: CollectedIngredient[], filter: FilterType) => {
  if (filter === 'available') return ingredients.filter(ing => !ing.used);
  if (filter === 'used') return ingredients.filter(ing => ing.used);
  return ingredients;
};

const filterByRarity = (ingredients: CollectedIngredient[], rarityFilter: RarityFilterType) => {
  if (rarityFilter === 'all') return ingredients;
  return ingredients.filter(ing => ing.ingredient.raridade === rarityFilter);
};

const searchIngredients = (ingredients: CollectedIngredient[], searchTerm: string) => {
  if (!searchTerm) return ingredients;
  const term = searchTerm.toLowerCase();
  return ingredients.filter(ing => 
    ing.ingredient.nome_portugues.toLowerCase().includes(term) ||
    ing.ingredient.nome_ingles.toLowerCase().includes(term)
  );
};

const sortIngredients = (ingredients: CollectedIngredient[], sortBy: SortType) => {
  return [...ingredients].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.ingredient.nome_portugues.localeCompare(b.ingredient.nome_portugues);
      case 'rarity':
        const rarityOrder = { 'unico': 4, 'raro': 3, 'incomum': 2, 'comum': 1 };
        const aRarity = a.ingredient.raridade || 'comum';
        const bRarity = b.ingredient.raridade || 'comum';
        return rarityOrder[bRarity] - rarityOrder[aRarity];
      case 'date':
      default:
        return b.collectedAt.getTime() - a.collectedAt.getTime();
    }
  });
};

export function useIngredientFilters(ingredients: CollectedIngredient[]) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [rarityFilter, setRarityFilter] = useState<RarityFilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIngredients = useMemo(() => {
    const filtered = filterIngredients(ingredients, filter);
    const rarityFiltered = filterByRarity(filtered, rarityFilter);
    const searched = searchIngredients(rarityFiltered, searchTerm);
    return sortIngredients(searched, sortBy);
  }, [ingredients, filter, rarityFilter, sortBy, searchTerm]);

  const clearFilters = useCallback(() => {
    setFilter('all');
    setRarityFilter('all');
    setSortBy('date');
    setSearchTerm('');
  }, []);

  return {
    filter,
    setFilter,
    rarityFilter,
    setRarityFilter,
    sortBy,
    setSortBy,
    searchTerm,
    setSearchTerm,
    filteredIngredients,
    clearFilters
  };
}

const filterByResult = (attempts: ForageAttempt[], filter: ResultFilterType) => {
  if (filter === 'success') return attempts.filter(a => a.success);
  if (filter === 'failure') return attempts.filter(a => !a.success);
  return attempts;
};

const filterByRegion = (attempts: ForageAttempt[], regionFilter: string) => {
  if (regionFilter === 'all') return attempts;
  return attempts.filter(a => a.region === regionFilter);
};

const filterByDate = (attempts: ForageAttempt[], dateFilter: DateFilterType) => {
  if (dateFilter === 'all') return attempts;
  
  const now = new Date();
  const attemptDate = attempts[0]?.timestamp;
  if (!attemptDate) return attempts;
  
  switch (dateFilter) {
    case 'today':
      return attempts.filter(a => a.timestamp.toDateString() === now.toDateString());
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return attempts.filter(a => a.timestamp >= weekAgo);
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return attempts.filter(a => a.timestamp >= monthAgo);
    default:
      return attempts;
  }
};

const sortAttempts = (attempts: ForageAttempt[]) => {
  return [...attempts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export function useActivityFilters(attempts: ForageAttempt[]) {
  const [filter, setFilter] = useState<ResultFilterType>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');

  const filteredAttempts = useMemo(() => {
    const resultFiltered = filterByResult(attempts, filter);
    const regionFiltered = filterByRegion(resultFiltered, regionFilter);
    const dateFiltered = filterByDate(regionFiltered, dateFilter);
    return sortAttempts(dateFiltered);
  }, [attempts, filter, regionFilter, dateFilter]);

  const getRegionOptions = useCallback(() => {
    const regions = [...new Set(attempts.map(a => a.region))];
    return regions.map(region => ({
      value: region,
      label: ingredientsService.getRegionDisplayName(region)
    }));
  }, [attempts]);

  const clearFilters = useCallback(() => {
    setFilter('all');
    setRegionFilter('all');
    setDateFilter('all');
  }, []);

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
