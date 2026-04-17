import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { createDocument } from './firestore';
import type { LicenseDocument, DocumentCategory } from '@/types/schema';

/**
 * Uploads a document to Firebase Storage and saves its metadata to Firestore.
 * Supports progress tracking and timeout.
 */
export async function uploadLicenseDocument(
  userId: string,
  file: File,
  metadata: {
    category: DocumentCategory;
    stateCode: string;
    licenseId?: string;
    expirationDate?: Date | null;
    notes?: string;
  },
  onProgress?: (progress: number) => void
): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const storagePath = `users/${userId}/documents/${timestamp}_${safeName}`;
  const storageRef = ref(storage, storagePath);

  console.log('Starting resumable upload to:', storagePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Set a timeout
    const timeout = setTimeout(() => {
      uploadTask.cancel();
      reject(new Error('Upload timed out after 30 seconds. Check your connection or Firebase Storage rules.'));
    }, 30000);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
        if (onProgress) onProgress(progress);
      },
      (error) => {
        clearTimeout(timeout);
        console.error('Upload task error:', error);
        reject(error);
      },
      async () => {
        clearTimeout(timeout);
        try {
          console.log('Upload complete, getting download URL...');
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          const docData: Omit<LicenseDocument, 'id' | 'userId'> = {
            category: metadata.category,
            stateCode: metadata.stateCode,
            licenseId: metadata.licenseId || null,
            fileName: file.name,
            storagePath: storagePath,
            downloadURL: downloadURL,
            mimeType: file.type,
            fileSize: file.size,
            uploadedAt: new Date(),
            expirationDate: metadata.expirationDate || null,
            version: 1,
            notes: metadata.notes || '',
          };

          const docId = await createDocument(userId, docData);
          console.log('Metadata saved with ID:', docId);
          resolve(docId);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}
