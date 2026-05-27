import { NextResponse } from 'next/server';
import { adminAuth, adminDb, adminInitError } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    if (adminInitError) {
      return NextResponse.json({ error: `Firebase Admin SDK failed to initialize: ${adminInitError}` }, { status: 500 });
    }
    const decodedToken = await adminAuth.verifyIdToken(token);
    const callerUid = decodedToken.uid;

    // Verify caller is an admin in Firestore
    const callerDoc = await adminDb.collection('users').doc(callerUid).get();
    const callerData = callerDoc.data();
    if (!callerData || callerData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    // Safeguard: Never delete the super admin
    const targetDoc = await adminDb.collection('users').doc(userId).get();
    const targetData = targetDoc.data();
    if (targetData?.email === 'larry.a.montgomery@gmail.com') {
      return NextResponse.json({ error: 'Critical Safeguard: The Super Admin account cannot be deleted.' }, { status: 400 });
    }

    // 1. Delete user from Firebase Auth (with graceful fallback if IAM permission is missing)
    try {
      await adminAuth.deleteUser(userId);
      console.log(`Successfully deleted user ${userId} from Firebase Auth.`);
    } catch (authError: any) {
      if (authError.code === 'auth/user-not-found') {
        console.warn(`User ${userId} not found in Firebase Auth.`);
      } else {
        console.warn(`Warning: Could not delete user ${userId} from Firebase Auth (likely missing IAM permissions). Proceeding with Firestore database cleanup. Error:`, authError.message);
      }
    }

    // 2. Delete Firestore subcollections
    const subcollections = ['licenses', 'ceus', 'documents', 'notifications', 'careers', 'practiceHours', 'certifications'];
    for (const colName of subcollections) {
      const snap = await adminDb.collection('users').doc(userId).collection(colName).get();
      const batch = adminDb.batch();
      snap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    // 3. Delete user document
    await adminDb.collection('users').doc(userId).delete();
    console.log(`Successfully deleted user ${userId} and all data from Firestore.`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error in delete-user backend:', error);
    const errorMsg = JSON.stringify(error, Object.getOwnPropertyNames(error));
    return NextResponse.json({ error: errorMsg || 'Internal server error' }, { status: 500 });
  }
}
