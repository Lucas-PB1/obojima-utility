import { useState, useCallback } from 'react';

/**
 * Hook para gerenciar o estado de abertura/fechamento de modais
 * 
 * @description
 * Hook utilitário que fornece funções para controlar o estado de modais,
 * incluindo abertura, fechamento e alternância, além do estado atual.
 * 
 * @param initialState - Estado inicial do modal (padrão: false)
 */
export function useModalState(initialState: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  /**
   * Abre o modal
   */
  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Fecha o modal
   */
  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Alterna o estado do modal (abre se fechado, fecha se aberto)
   */
  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    setIsOpen
  };
}
