import { useState, useRef, useCallback } from 'react';
import { exportImportService } from '@/services/exportImportService';
import { storageService } from '@/services/storageService';
import { recipeService } from '@/services/recipeService';
import { createdPotionService } from '@/services/createdPotionService';

/**
 * Hook para gerenciar operações de backup e importação de dados
 * 
 * @description
 * Este hook encapsula toda a lógica de backup e importação do sistema, incluindo:
 * - Exportação de dados em diferentes formatos (TXT e JSON)
 * - Importação de backups completos
 * - Limpeza de todos os dados do sistema
 * - Gerenciamento de estados de importação
 * 
 */
export function useBackupOperations() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /**
   * Exporta todos os dados do sistema em formato TXT legível
   */
  const handleExportAll = useCallback(() => {
    exportImportService.exportAllData();
  }, []);

  /**
   * Exporta todos os dados do sistema em formato JSON para importação
   */
  const handleExportJSON = useCallback(() => {
    exportImportService.exportAllDataAsJSON();
  }, []);

  /**
   * Limpa todos os dados do sistema após confirmação do usuário
   */
  const handleClearAll = useCallback(() => {
    if (confirm('⚠️ ATENÇÃO: Isso irá limpar TODOS os dados do sistema!\n\n• Todos os ingredientes coletados\n• Todas as poções criadas\n• Todas as receitas\n• Todos os logs de forrageamento\n\nEsta ação NÃO pode ser desfeita. Tem certeza?')) {
      storageService.clearAllData();
      recipeService.clearAllRecipes();
      createdPotionService.clearAllCreatedPotions();
      alert('✅ Todos os dados foram limpos com sucesso!');
      window.location.reload();
    }
  }, []);

  /**
   * Abre o seletor de arquivos para importação
   */
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Processa o arquivo selecionado para importação
   * 
   * @param event - Evento de mudança do input de arquivo
   */
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportMessage(null);

    try {
      const result = await exportImportService.importSpecificData(file, 'complete');
      
      if (result.success) {
        setImportMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setImportMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setImportMessage({ type: 'error', text: `Erro ao importar: ${error}` });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  return {
    fileInputRef,
    isImporting,
    importMessage,
    handleExportAll,
    handleExportJSON,
    handleClearAll,
    handleImportClick,
    handleFileSelect
  };
}
