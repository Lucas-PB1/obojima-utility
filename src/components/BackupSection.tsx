'use client';

import React, { useRef, useState } from 'react';
import { exportImportService } from '../services/exportImportService';
import { storageService } from '../services/storageService';
import { recipeService } from '../services/recipeService';
import { createdPotionService } from '../services/createdPotionService';
import ContentCard from './ui/ContentCard';
import Button from './ui/Button';

/**
 * Componente para gerenciar operações de backup e importação de dados
 * 
 * @description
 * Este componente fornece funcionalidades completas de backup e importação,
 * incluindo exportação em diferentes formatos e limpeza de dados.
 */
export const BackupSection: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /**
   * Exporta todos os dados em formato TXT legível
   */
  const handleExportAll = () => {
    exportImportService.exportAllData();
  };

  /**
   * Exporta todos os dados em formato JSON para importação
   */
  const handleExportJSON = () => {
    exportImportService.exportAllDataAsJSON();
  };

  /**
   * Limpa todos os dados do sistema após confirmação
   */
  const handleClearAll = () => {
    if (confirm('⚠️ ATENÇÃO: Isso irá limpar TODOS os dados do sistema!\n\n• Todos os ingredientes coletados\n• Todas as poções criadas\n• Todas as receitas\n• Todos os logs de forrageamento\n\nEsta ação NÃO pode ser desfeita. Tem certeza?')) {
      storageService.clearAllData();
      recipeService.clearAllRecipes();
      createdPotionService.clearAllCreatedPotions();
      alert('✅ Todos os dados foram limpos com sucesso!');
      window.location.reload();
    }
  };

  /**
   * Abre o seletor de arquivos para importação
   */
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Processa o arquivo selecionado para importação
   * 
   * @param event - Evento de mudança do input de arquivo
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  return (
    <ContentCard>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            💾 Backup Completo do Sistema
          </h3>
          <p className="text-gray-600 text-sm">
            Exporte todos os dados do sistema (ingredientes, poções, receitas e logs) em um único arquivo.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📋 O que será exportado:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Todos os ingredientes coletados</li>
            <li>• Todas as poções criadas no inventário</li>
            <li>• Todas as receitas de poções</li>
            <li>• Todos os logs de forrageamento</li>
            <li>• Estatísticas e metadados</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">📤 Exportar Dados</h4>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button
              onClick={handleExportAll}
              variant="primary"
              size="lg"
              className="px-6"
            >
              📄 Exportar TXT (Legível)
            </Button>
            
            <Button
              onClick={handleExportJSON}
              variant="secondary"
              size="lg"
              className="px-6"
            >
              📋 Exportar JSON (Importável)
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">📥 Importar Backup</h4>
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={handleImportClick}
              variant="secondary"
              size="lg"
              className="px-6"
              disabled={isImporting}
            >
              {isImporting ? '⏳ Importando...' : '📥 Importar Backup Completo'}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {importMessage && (
              <div className={`p-3 rounded-lg text-sm ${
                importMessage.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {importMessage.type === 'success' ? '✅' : '❌'} {importMessage.text}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">🗑️ Limpeza Geral</h4>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-red-800 text-sm mb-3">
              <strong>⚠️ ATENÇÃO:</strong> Esta ação irá limpar TODOS os dados do sistema permanentemente!
            </p>
            <Button
              onClick={handleClearAll}
              variant="danger"
              size="lg"
              className="px-6"
            >
              🗑️ Limpar Todos os Dados
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center space-y-1">
          <div><strong>TXT:</strong> Formato legível para visualização</div>
          <div><strong>JSON:</strong> Formato para importação no sistema</div>
        </div>
      </div>
    </ContentCard>
  );
};
