'use client';

import React from 'react';
import { exportImportService } from '../services/exportImportService';
import ContentCard from './ui/ContentCard';
import Button from './ui/Button';

export const BackupSection: React.FC = () => {
  const handleExportAll = () => {
    exportImportService.exportAllData();
  };

  const handleExportJSON = () => {
    exportImportService.exportAllDataAsJSON();
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

        <div className="text-xs text-gray-500 text-center space-y-1">
          <div><strong>TXT:</strong> Formato legível para visualização</div>
          <div><strong>JSON:</strong> Formato para importação no sistema</div>
        </div>
      </div>
    </ContentCard>
  );
};
