'use client';

import React, { useState, useRef } from 'react';
import { exportImportService } from '../../services/exportImportService';
import Button from './Button';
import Modal from './Modal';

interface ExportImportSectionProps {
  type: 'ingredients' | 'potions' | 'recipes' | 'logs' | 'all';
  onDataImported?: () => void;
  className?: string;
}

export default function ExportImportSection({ 
  type, 
  onDataImported,
  className = ''
}: ExportImportSectionProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    switch (type) {
      case 'ingredients':
        exportImportService.exportIngredients();
        break;
      case 'potions':
        exportImportService.exportCreatedPotions();
        break;
      case 'recipes':
        exportImportService.exportRecipes();
        break;
      case 'logs':
        exportImportService.exportLogs();
        break;
      case 'all':
        exportImportService.exportAllData();
        break;
    }
  };

  const handleExportJSON = () => {
    switch (type) {
      case 'ingredients':
        exportImportService.exportIngredientsAsJSON();
        break;
      case 'potions':
        exportImportService.exportCreatedPotionsAsJSON();
        break;
      case 'recipes':
        exportImportService.exportRecipesAsJSON();
        break;
      case 'logs':
        exportImportService.exportLogsAsJSON();
        break;
      case 'all':
        exportImportService.exportAllDataAsJSON();
        break;
    }
  };

  const handleImportClick = () => {
    setShowImportModal(true);
    setImportResult(null);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      let result;
      
      if (type === 'all') {
        // Para backup completo, usar importData
        result = await exportImportService.importData(file);
      } else {
        // Para tipos específicos, usar importSpecificData
        const typeMap = {
          'ingredients': 'ingredients',
          'potions': 'createdPotions',
          'recipes': 'recipes',
          'logs': 'logs'
        };
        result = await exportImportService.importSpecificData(file, typeMap[type as keyof typeof typeMap]);
      }
      
      setImportResult(result);
      
      if (result.success && onDataImported) {
        onDataImported();
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: `Erro ao importar arquivo: ${error}`
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleCloseModal = () => {
    setShowImportModal(false);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'ingredients':
        return 'Ingredientes';
      case 'potions':
        return 'Poções Criadas';
      case 'recipes':
        return 'Receitas';
      case 'logs':
        return 'Logs';
      case 'all':
        return 'Dados Completos';
    }
  };

  const getTypeDescription = () => {
    switch (type) {
      case 'ingredients':
        return 'Exportar/importar lista de ingredientes coletados';
      case 'potions':
        return 'Exportar/importar poções criadas no inventário';
      case 'recipes':
        return 'Exportar/importar receitas de poções';
      case 'logs':
        return 'Exportar/importar logs de forrageamento';
      case 'all':
        return 'Exportar/importar todos os dados do sistema';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-totoro-blue/20 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-totoro-gray mb-4">
        💾 Backup - {getTypeLabel()}
      </h3>
      
      <p className="text-sm text-totoro-gray/70 mb-4">
        {getTypeDescription()}
      </p>

      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <Button
            onClick={handleExport}
            variant="primary"
            className="flex-1"
          >
            📄 TXT (Legível)
          </Button>
          
          <Button
            onClick={handleExportJSON}
            variant="secondary"
            className="flex-1"
          >
            📋 JSON (Importável)
          </Button>
        </div>
        
        <Button
          onClick={handleImportClick}
          variant="secondary"
          className="w-full"
        >
          📥 Importar {getTypeLabel()}
        </Button>
      </div>

      {/* Modal de Importação */}
      <Modal
        isOpen={showImportModal}
        onClose={handleCloseModal}
        title={`Importar ${getTypeLabel()}`}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Selecione um arquivo TXT ou JSON para importar os dados. 
              {type === 'all' && ' O arquivo deve conter todos os dados do sistema.'}
              <br />
              <strong>Recomendado:</strong> Use arquivos JSON exportados pelo sistema para melhor compatibilidade.
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.json"
              onChange={handleFileSelect}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-totoro-blue focus:border-transparent"
              disabled={isImporting}
            />
          </div>

          {isImporting && (
            <div className="text-center py-4">
              <div className="text-totoro-blue">Importando dados...</div>
            </div>
          )}

          {importResult && (
            <div className={`p-4 rounded-lg ${
              importResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`font-medium ${
                importResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {importResult.success ? '✅ Sucesso!' : '❌ Erro'}
              </div>
              <div className={`text-sm mt-1 ${
                importResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {importResult.message}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleCloseModal}
              disabled={isImporting}
            >
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
