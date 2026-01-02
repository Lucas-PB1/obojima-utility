import React, { useState } from 'react';
import Button from '@/components/ui/Button';

export default function SystemMigration() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const migratePublicProfiles = async () => {
    if (!confirm('Isso irá ler todos os usuários e recriar os perfis públicos. Continuar?')) return;

    setLoading(true);
    setStatus('Iniciando migração via servidor...');

    try {
      const response = await fetch('/api/admin/migrate-public-profiles', {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Erro desconhecido');
      }

      setStatus(`Sucesso: ${data.message}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      setStatus(`Erro: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 space-y-4">
      <h2 className="text-xl font-bold text-totoro-gray">Ferramentas de Sistema</h2>
      <div className="flex flex-col gap-4">
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <h3 className="font-bold mb-2">Sincronizar Perfis Públicos</h3>
          <p className="text-sm text-totoro-gray/60 mb-4">
            Use isso para popular a coleção &apos;public_users&apos; baseada nos usuários
            existentes. Necessário para a busca de amigos funcionar para usuários antigos.
          </p>
          <Button onClick={migratePublicProfiles} disabled={loading}>
            {loading ? 'Processando...' : 'Executar Migração'}
          </Button>
          {status && (
            <p
              className={`mt-2 text-sm font-bold ${status.includes('Erro') ? 'text-red-500' : 'text-green-600'}`}
            >
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
