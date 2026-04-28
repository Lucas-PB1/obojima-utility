import * as admin from 'firebase-admin';
import { logger } from '@/utils/logger';

const PRIVATE_KEY_HEADER = '-----BEGIN PRIVATE KEY-----';
const PRIVATE_KEY_FOOTER = '-----END PRIVATE KEY-----';

function getEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (value) return value;
  }

  return undefined;
}

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();
  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];

  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function normalizePrivateKey(rawKey?: string): string | undefined {
  if (!rawKey) return undefined;

  let key = stripWrappingQuotes(rawKey).replace(/\\n/g, '\n');

  if (!key.includes(PRIVATE_KEY_HEADER)) {
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf8');
      if (decoded.includes(PRIVATE_KEY_HEADER)) {
        key = decoded;
      }
    } catch {
      // Keep the original key and let the validation below report a clear error.
    }
  }

  if (key.includes(PRIVATE_KEY_HEADER) && !key.includes('\n')) {
    const body = key
      .replace(PRIVATE_KEY_HEADER, '')
      .replace(PRIVATE_KEY_FOOTER, '')
      .replace(/\s+/g, '');

    key = `${PRIVATE_KEY_HEADER}\n${body.match(/.{1,64}/g)?.join('\n') || body}\n${PRIVATE_KEY_FOOTER}\n`;
  }

  return key;
}

function assertPrivateKey(privateKey?: string): asserts privateKey is string {
  if (!privateKey?.includes(PRIVATE_KEY_HEADER) || !privateKey.includes(PRIVATE_KEY_FOOTER)) {
    throw new Error(
      '[Firebase Admin]: FIREBASE_PRIVATE_KEY inválida. Use a chave PEM completa com \\n, quebras reais de linha ou base64.'
    );
  }
}

if (!admin.apps.length) {
  const projectId = getEnv('FIREBASE_PROJECT_ID', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  const clientEmail = getEnv('FIREBASE_CLIENT_EMAIL', 'FIREBASE_ADMIN_CLIENT_EMAIL');
  const privateKey = normalizePrivateKey(
    getEnv('FIREBASE_PRIVATE_KEY', 'FIREBASE_ADMIN_PRIVATE_KEY')
  );

  if (!projectId || !clientEmail || !privateKey) {
    logger.error(
      '[Firebase Admin]: Variáveis de ambiente faltando. Verifique FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL/FIREBASE_ADMIN_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY/FIREBASE_ADMIN_PRIVATE_KEY.'
    );
  }

  try {
    assertPrivateKey(privateKey);

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
  } catch (error) {
    logger.error('[Firebase Admin]: Erro crítico na inicialização:', error);
    throw error;
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
