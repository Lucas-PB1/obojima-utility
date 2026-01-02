import * as admin from 'firebase-admin';
import serviceAccount from '../../obojima-b50d8-firebase-adminsdk-fbsvc-5fce6d75a6.json';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
    console.log('[Firebase Admin]: Inicializado com sucesso usando arquivo de service account');
  } catch (error) {
    console.error('[Firebase Admin]: Erro crítico na inicialização:', error);
    throw error;
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
