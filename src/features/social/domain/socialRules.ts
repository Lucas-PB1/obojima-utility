import { SocialNotificationType } from '@/types/social';

export const MAX_SOCIAL_MESSAGE_LENGTH = 2000;

export function getSortedPair(uid1: string, uid2: string): [string, string] {
  return uid1 < uid2 ? [uid1, uid2] : [uid2, uid1];
}

export function getPairDocumentId(uid1: string, uid2: string): string {
  const [first, second] = getSortedPair(uid1, uid2);
  return `${first}_${second}`;
}

export function getFriendshipId(uid1: string, uid2: string): string {
  return getPairDocumentId(uid1, uid2);
}

export function getChatId(uid1: string, uid2: string): string {
  return getPairDocumentId(uid1, uid2);
}

export function getBlockId(blockerId: string, blockedUserId: string): string {
  return `${blockerId}_${blockedUserId}`;
}

export function getFriendRequestId(fromUserId: string, toUserId: string): string {
  return `${fromUserId}_${toUserId}`;
}

export function normalizeSocialMessage(content: string): string {
  return content.replace(/\s+/g, ' ').trim();
}

export function validateSocialMessage(content: string): string | null {
  const normalized = normalizeSocialMessage(content);

  if (!normalized) return 'Message cannot be empty';
  if (normalized.length > MAX_SOCIAL_MESSAGE_LENGTH) {
    return `Message cannot exceed ${MAX_SOCIAL_MESSAGE_LENGTH} characters`;
  }

  return null;
}

export function isValidSocialMessage(content: string): boolean {
  return validateSocialMessage(content) === null;
}

export function hasSocialBlock(blockerIds: string[], uid1: string, uid2: string): boolean {
  return blockerIds.includes(getBlockId(uid1, uid2)) || blockerIds.includes(getBlockId(uid2, uid1));
}

export function buildSocialNotificationCopy(
  type: SocialNotificationType,
  actorName: string,
  preview?: string
): { title: string; body: string } {
  switch (type) {
    case 'friend_request':
      return {
        title: 'Nova solicitação de amizade',
        body: `${actorName} quer adicionar você.`
      };
    case 'friend_accepted':
      return {
        title: 'Solicitação aceita',
        body: `${actorName} aceitou seu pedido de amizade.`
      };
    case 'message':
      return {
        title: `Mensagem de ${actorName}`,
        body: preview || 'Você recebeu uma nova mensagem.'
      };
    case 'trade':
      return {
        title: 'Troca recebida',
        body: `${actorName} enviou itens para você.`
      };
    default:
      return {
        title: 'Atualização social',
        body: preview || 'Há uma nova atualização no social.'
      };
  }
}
