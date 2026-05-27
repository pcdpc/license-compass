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

    // In production on Firebase Cloud Functions, always use the default Service Account (ADC)
    // because private key strings often get mangled or double-escaped during deployment.
    if (process.env.NODE_ENV === 'production' || process.env.K_SERVICE) {
      console.log("[Firebase] Production environment detected. Using default service account/ADC.");
      return admin.initializeApp();
    }

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
