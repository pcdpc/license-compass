import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { StateLicense, CeuEntry, LicenseDocument, UserProfile, InAppNotification } from '@/types/schema';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert a Firestore Timestamp (or Date) to a JS Date */
export function toDate(ts: any): Date | null {
  if (!ts) return null;
  if (ts instanceof Date) return ts;
  if (ts?.toDate) return ts.toDate();
  if (ts?.seconds) return new Date(ts.seconds * 1000);
  return null;
}

/** Days until a given date. Negative = already past. */
export function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Strip undefined values from an object before sending to Firestore */
function stripUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => stripUndefined(item));
  }
  if (typeof obj !== 'object' || obj === null || obj instanceof Date || obj instanceof Timestamp) {
    return obj;
  }
  const clean: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      clean[key] = stripUndefined(obj[key]);
    }
  });
  return clean;
}

// ─── User Profile ───────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function createUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', userId), stripUndefined({
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', userId), stripUndefined({
    ...data,
    updatedAt: serverTimestamp(),
  }));
}

export async function getAllUsers(): Promise<(UserProfile & { id: string })[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile & { id: string }));
}

// ─── State Licenses ─────────────────────────────────────────────────────────

const licensesCol = (userId: string) =>
  collection(db, 'users', userId, 'licenses');

export async function getUserLicenses(userId: string): Promise<StateLicense[]> {
  const q = query(licensesCol(userId), orderBy('stateName', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as StateLicense));
}

export async function getLicense(userId: string, licenseId: string): Promise<StateLicense | null> {
  const snap = await getDoc(doc(db, 'users', userId, 'licenses', licenseId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as StateLicense) : null;
}

export async function getLicenseByState(userId: string, stateCode: string): Promise<StateLicense | null> {
  const q = query(licensesCol(userId), where('stateCode', '==', stateCode));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as StateLicense;
}

export async function createLicense(userId: string, data: Omit<StateLicense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(licensesCol(userId), stripUndefined({
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  return docRef.id;
}

export async function updateLicense(userId: string, licenseId: string, data: Partial<StateLicense>): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'licenses', licenseId), stripUndefined({
    ...data,
    updatedAt: serverTimestamp(),
  }));
}

export async function deleteLicense(userId: string, licenseId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'licenses', licenseId));
}

// ─── CEU Entries ────────────────────────────────────────────────────────────

const ceusCol = (userId: string) =>
  collection(db, 'users', userId, 'ceus');

export async function getUserCeus(userId: string): Promise<CeuEntry[]> {
  const q = query(ceusCol(userId), orderBy('courseDate', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CeuEntry));
}

export async function createCeu(userId: string, data: Omit<CeuEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(ceusCol(userId), stripUndefined({
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  return docRef.id;
}

export async function updateCeu(userId: string, ceuId: string, data: Partial<CeuEntry>): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'ceus', ceuId), stripUndefined({
    ...data,
    updatedAt: serverTimestamp(),
  }));
}

export async function deleteCeu(userId: string, ceuId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'ceus', ceuId));
}

// ─── Documents ──────────────────────────────────────────────────────────────

const docsCol = (userId: string) =>
  collection(db, 'users', userId, 'documents');

export async function getUserDocuments(userId: string): Promise<LicenseDocument[]> {
  const q = query(docsCol(userId), orderBy('uploadedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as LicenseDocument));
}

export async function createDocument(userId: string, data: Omit<LicenseDocument, 'id' | 'userId'>): Promise<string> {
  const docRef = await addDoc(docsCol(userId), stripUndefined({
    ...data,
    userId,
  }));
  return docRef.id;
}

export async function getDocumentsByState(userId: string, stateCode: string): Promise<LicenseDocument[]> {
  const q = query(
    docsCol(userId), 
    where('stateCode', 'in', [stateCode, 'ALL'])
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as LicenseDocument));
  
  // Sort in-memory by date (descending) to avoid needing a composite index
  return docs.sort((a, b) => {
    const timeA = a.uploadedAt instanceof Date ? a.uploadedAt.getTime() : (a.uploadedAt as any).seconds * 1000;
    const timeB = b.uploadedAt instanceof Date ? b.uploadedAt.getTime() : (b.uploadedAt as any).seconds * 1000;
    return timeB - timeA;
  });
}

export async function deleteDocument(userId: string, documentId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'documents', documentId));
}

export async function updateDocument(userId: string, documentId: string, data: Partial<LicenseDocument>): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'documents', documentId), stripUndefined({
    ...data,
    updatedAt: new Date()
  }));
}

// ─── Notifications ──────────────────────────────────────────────────────────

const notifsCol = (userId: string) =>
  collection(db, 'users', userId, 'notifications');

export async function getUserNotifications(userId: string): Promise<InAppNotification[]> {
  const q = query(notifsCol(userId));
  const snap = await getDocs(q);
  const notifs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as InAppNotification));
  
  // Filter and sort in-memory to avoid needing a composite index
  return notifs
    .filter(n => !n.read)
    .sort((a, b) => {
      const timeA = toDate(a.createdAt)?.getTime() || 0;
      const timeB = toDate(b.createdAt)?.getTime() || 0;
      return timeB - timeA;
    });
}

export async function markNotificationAsRead(userId: string, notifId: string): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'notifications', notifId), {
    read: true,
  });
}

export async function clearAllNotifications(userId: string): Promise<void> {
  const q = query(notifsCol(userId), where('read', '==', false));
  const snap = await getDocs(q);
  const batch = snap.docs.map(d => updateDoc(d.ref, { read: true }));
  await Promise.all(batch);
}

export async function createNotification(userId: string, data: Omit<InAppNotification, 'id' | 'userId' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(notifsCol(userId), stripUndefined({
    ...data,
    userId,
    createdAt: serverTimestamp(),
  }));
  return docRef.id;
}

export async function deleteUserFullAccount(userId: string): Promise<void> {
  // Safeguard: Never delete the super admin
  const userProfile = await getUserProfile(userId);
  if (userProfile?.email === 'larry.a.montgomery@gmail.com') {
    throw new Error("Critical Safeguard: The Super Admin account cannot be deleted.");
  }

  // 1. Delete all sub-collection data
  const collections = ['licenses', 'ceus', 'documents', 'notifications'];
  
  for (const colName of collections) {
    const colRef = collection(db, 'users', userId, colName);
    const snap = await getDocs(colRef);
    const batch = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(batch);
  }

  // 2. Delete the main User Profile
  await deleteDoc(doc(db, 'users', userId));
}

// ─── Helpers moved to top ──────────────────────────────────────────────────
