import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { readFileSync } from 'fs';

// simple .env parser
const env = readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) {
    acc[key.trim()] = val.join('=').trim().replace(/^"|"$/g, '');
  }
  return acc;
}, {});

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clean() {
  console.log('Fetching users...');
  const usersSnap = await getDocs(collection(db, 'users'));
  let count = 0;
  for (const userDoc of usersSnap.docs) {
    const licensesSnap = await getDocs(collection(db, 'users', userDoc.id, 'licenses'));
    for (const licenseDoc of licensesSnap.docs) {
      const data = licenseDoc.data();
      if (data.tasks && data.tasks.length > 0) {
        await updateDoc(doc(db, 'users', userDoc.id, 'licenses', licenseDoc.id), { tasks: [] });
        count++;
      }
    }
  }
  console.log(`Cleaned tasks from ${count} licenses.`);
  process.exit(0);
}

clean().catch(console.error);
