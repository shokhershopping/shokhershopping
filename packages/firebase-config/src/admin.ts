import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      '\n⚠️  Firebase Admin SDK credentials missing!\n' +
      '   Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local\n' +
      '   Get these from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key\n'
    );
    // Initialize without credentials (will fail on actual API calls but won't crash on import)
    return initializeApp({ projectId: projectId || 'placeholder' });
  }

  const serviceAccount: ServiceAccount = {
    projectId,
    privateKey: privateKey.replace(/\\n/g, '\n'),
    clientEmail,
  };

  return initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const app = getFirebaseAdminApp();

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
export const adminStorage = getStorage(app);
export { app as adminApp };
