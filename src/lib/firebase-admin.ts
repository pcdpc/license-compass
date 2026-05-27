import * as admin from 'firebase-admin';

export let adminInitError: string | null = null;

const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    const {
      FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY,
    } = process.env;

    const projectId = FIREBASE_PROJECT_ID || NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
      console.log(`[Firebase] Initializing with explicit credentials for project: ${projectId}`);
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      console.warn("[Firebase] Missing explicit credentials. Attempting default service account/ADC.");
      return admin.initializeApp();
    }
  } catch (error: any) {
    adminInitError = error.stack;
    console.error('[Firebase] Initialization Error:', error.stack);
    throw error;
  }
};

const app = initializeFirebaseAdmin();

export const adminDb = app.firestore();
export const adminAuth = app.auth();
