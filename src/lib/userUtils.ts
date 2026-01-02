/**
 * Utilitários compartilhados (Client e Server) para usuários
 */
export const UserUtils = {
  /**
   * Obtém o nome padrão baseado no email (prefixo antes do @)
   */
  getFallbackName(email: string | null | undefined): string | null {
    if (!email) return null;
    return email.split('@')[0];
  }
};
