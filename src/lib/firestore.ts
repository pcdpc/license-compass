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
import type { StateLicense, CeuEntry, LicenseDocument, UserProfile } from '@/types/schema';

// ─── User Profile ───────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function createUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', userId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', userId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
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
  const docRef = await addDoc(licensesCol(userId), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateLicense(userId: string, licenseId: string, data: Partial<StateLicense>): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'licenses', licenseId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
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
  const docRef = await addDoc(ceusCol(userId), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCeu(userId: string, ceuId: string, data: Partial<CeuEntry>): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'ceus', ceuId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
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
  const docRef = await addDoc(docsCol(userId), {
    ...data,
    userId,
  });
  return docRef.id;
}

export async function deleteDocument(userId: string, documentId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'documents', documentId));
}

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
