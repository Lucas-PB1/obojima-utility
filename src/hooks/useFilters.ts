import { useState, useMemo, useCallback } from 'react';
import { CollectedIngredient, ForageAttempt } from '@/types/ingredients';
import { ingredientsService } from '@/services/ingredientsService';

/**
 * Tipos de filtro para ingredientes
 */
export type FilterType = 'all' | 'available' | 'used';
export type RarityFilterType = 'all' | 'comum' | 'incomum' | 'raro' | 'unico';
export type SortType = 'date' | 'name' | 'rarity';
export type ResultFilterType = 'all' | 'success' | 'failure';
export type DateFilterType = 'all' | 'today' | 'week' | 'month';

/**
 * Filtra ingredientes por status (disponível/usado)
 * 
 * @param ingredients - Lista de ingredientes
 * @param filter - Tipo de filtro a ser aplicado
 * @returns Lista filtrada de ingredientes
 */
const filterIngredients = (ingredients: CollectedIngredient[], filter: FilterType) => {
  if (filter === 'available') return ingredients.filter(ing => !ing.used);
  if (filter === 'used') return ingredients.filter(ing => ing.used);
  return ingredients;
};

/**
 * Filtra ingredientes por raridade
 * 
 * @param ingredients - Lista de ingredientes
 * @param rarityFilter - Filtro de raridade
 * @returns Lista filtrada por raridade
 */
const filterByRarity = (ingredients: CollectedIngredient[], rarityFilter: RarityFilterType) => {
  if (rarityFilter === 'all') return ingredients;
  return ingredients.filter(ing => ing.ingredient.raridade === rarityFilter);
};

/**
 * Busca ingredientes por termo de pesquisa
 * 
 * @param ingredients - Lista de ingredientes
 * @param searchTerm - Termo de pesquisa
 * @returns Lista filtrada por termo de pesquisa
 */
const searchIngredients = (ingredients: CollectedIngredient[], searchTerm: string) => {
  if (!searchTerm) return ingredients;
  const term = searchTerm.toLowerCase();
  return ingredients.filter(ing => 
    ing.ingredient.nome_portugues.toLowerCase().includes(term) ||
    ing.ingredient.nome_ingles.toLowerCase().includes(term)
  );
};

/**
 * Ordena ingredientes por critério específico
 * 
 * @param ingredients - Lista de ingredientes
 * @param sortBy - Critério de ordenação
 * @returns Lista ordenada de ingredientes
 */
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

/**
 * Hook para gerenciar filtros de ingredientes
 * 
 * @description
 * Este hook encapsula toda a lógica de filtros para ingredientes, incluindo:
 * - Filtros por status (disponível/usado)
 * - Filtros por raridade
 * - Busca por termo
 * - Ordenação por diferentes critérios
 * 
 * @param ingredients - Lista de ingredientes a ser filtrada
 */
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

  /**
   * Limpa todos os filtros aplicados
   */
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

/**
 * Filtra tentativas por resultado (sucesso/falha)
 * 
 * @param attempts - Lista de tentativas
 * @param filter - Filtro de resultado
 * @returns Lista filtrada por resultado
 */
const filterByResult = (attempts: ForageAttempt[], filter: ResultFilterType) => {
  if (filter === 'success') return attempts.filter(a => a.success);
  if (filter === 'failure') return attempts.filter(a => !a.success);
  return attempts;
};

/**
 * Filtra tentativas por região
 * 
 * @param attempts - Lista de tentativas
 * @param regionFilter - Filtro de região
 * @returns Lista filtrada por região
 */
const filterByRegion = (attempts: ForageAttempt[], regionFilter: string) => {
  if (regionFilter === 'all') return attempts;
  return attempts.filter(a => a.region === regionFilter);
};

/**
 * Filtra tentativas por período de tempo
 * 
 * @param attempts - Lista de tentativas
 * @param dateFilter - Filtro de data
 * @returns Lista filtrada por período
 */
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

/**
 * Ordena tentativas por data (mais recente primeiro)
 * 
 * @param attempts - Lista de tentativas
 * @returns Lista ordenada por data
 */
const sortAttempts = (attempts: ForageAttempt[]) => {
  return [...attempts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

/**
 * Hook para gerenciar filtros de atividades de forrageamento
 * 
 * @description
 * Este hook encapsula toda a lógica de filtros para atividades, incluindo:
 * - Filtros por resultado (sucesso/falha)
 * - Filtros por região
 * - Filtros por período de tempo
 * - Ordenação por data
 * 
 * @param attempts - Lista de tentativas a ser filtrada
 */
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

  /**
   * Retorna as opções de região disponíveis para filtro
   * 
   * @returns Lista de opções de região
   */
  const getRegionOptions = useCallback(() => {
    const regions = [...new Set(attempts.map(a => a.region))];
    return regions.map(region => ({
      value: region,
      label: ingredientsService.getRegionDisplayName(region)
    }));
  }, [attempts]);

  /**
   * Limpa todos os filtros aplicados
   */
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
