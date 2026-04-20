// src/lib/firebaseClient.ts
// Replaces src/lib/supabaseClient.ts
// Used in frontend for reading doctors & lab tests from Firestore

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Prevent duplicate initialization in dev (HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db  = getFirestore(app);

// ─── Helper: fetch all docs from a collection ─────────────────────────────
export const fetchCollection = async <T = Record<string, unknown>>(
  collectionName: string
): Promise<(T & { id: string })[]> => {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
};

// ─── Helper: fetch with a where filter ────────────────────────────────────
export const fetchWhere = async <T = Record<string, unknown>>(
  collectionName: string,
  field: string,
  value: unknown
): Promise<(T & { id: string })[]> => {
  const q    = query(collection(db, collectionName), where(field, '==', value));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
};