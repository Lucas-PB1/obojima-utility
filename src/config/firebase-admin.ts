import * as admin from 'firebase-admin';
import serviceAccount from '../../firebase-admin.json';
import { logger } from '@/utils/logger';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
  } catch (error) {
    logger.error('[Firebase Admin]: Erro crítico na inicialização:', error);
    throw error;
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
